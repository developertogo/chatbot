import WebSocket from 'ws';

import { createParser } from './parser';

// Message definitions

type HelpMessage = {
  kind: "help";
};

type AddReminderMessage = {
  kind: "add-reminder";
  text: string;
  seconds: number;
};

type ListRemindersMessage = {
  kind: "list-reminders";
};

type ClearAllRemindersMessage = {
  kind: "clear-all-reminders";
};

type ClearReminderMessage = {
  kind: "clear-reminder";
  id: number;
};

type UnknownMessage = {
  kind: "unknown";
};

type Message = HelpMessage
             | AddReminderMessage
             | ListRemindersMessage
             | ClearAllRemindersMessage
             | ClearReminderMessage
             | UnknownMessage;

// Parsing

const parseMessage = createParser<Message>({
  intents: [
    {
      regexps: [
        /^help\.?$/i,
      ],
      func: () => ({ kind: 'help' }),
    },
    {
      regexps: [
        /^(?:remind|tell) me to (?<text>.*) in (?<quantity>\d+|a|an) (?<unit>(?:second|minute|hour)s?)\.?$/i,
        /^in (?<quantity>\d+|a|an) (?<unit>(?:second|minute|hour)s?),? (?:remind|tell) me to (?<text>.*)\.?$/i,
      ],
      func: ({ text, quantity, unit }) => {
        let seconds = quantity.startsWith("a") ? 1 : Number(quantity);

        if (unit.toLowerCase().startsWith("minute")) {
          seconds *= 60;
        } else if (unit.toLowerCase().startsWith("hour")) {
          seconds *= 3600;
        }

        return { kind: "add-reminder", seconds, text };
      },
    },
    {
      regexps: [
        /^(?:list|show|tell) (?:(?:me|all|of|my) )*reminders\.?$/i,
      ],
      func: () => ({ kind: "list-reminders" }),
    },
    {
      regexps: [
        /^(?:clear|delete|remove|forget) (?:(?:all|of|my) )*reminders\.?$/i,
      ],
      func: () => ({ kind: "clear-all-reminders" }),
    },
    {
      regexps: [
        /^(?:clear|delete|remove|forget) (?:reminder )?(?<id>\d+)\.?$/i,
      ],
      func: ({ id }) => ({ kind: "clear-reminder", id: Number(id) }),
    },
  ],
  fallback: { kind: "unknown" },
});

// Domain logic

const helpMessage = `I am a reminder bot, here to help you get organized. Here are some of the things you can ask me to do:

<ul>
  <li>Add reminders, e.g. <tt>remind me to make dinner in 5 minutes</tt>.</li>
  <li>List reminders, e.g. <tt>show all reminders</tt>.
  <li>Clear reminders, e.g. <tt>clear all reminders</tt> or <tt>clear reminder 3</tt>.
</ul>

At the moment I am not very sophisticated, but maybe you can help make me better!`;

type Reminder = {
  id: number;
  date: Date;
  text: string;
  timeout: NodeJS.Timeout;
};

type State = {
  ws: WebSocket;
  reminders: Reminder[];
  nextId: number;
};

function executeMessage(state: State, message: Message) {
  switch (message.kind) {
    case "help": {
      return helpMessage;
    }

    case "add-reminder": {
      const seconds = message.seconds;
      const text = message.text
        .replace(/\bmy\b/g, 'your')
        .replace(/\bme\b/g, 'you');

      const id = state.nextId++;

      const date = new Date();
      date.setSeconds(date.getSeconds() + seconds);

      const timeout = setTimeout(() => {
        state.ws.send(`It is time to ${text}!`);
        state.reminders = state.reminders.filter((r) => r.id !== id);
      }, seconds * 1000);

      state.reminders.push({ id, date, text, timeout });

      const unit = seconds === 1 ? 'second' : 'seconds';
      return `Ok, I will remind you to ${text} in ${seconds} ${unit}.`;
    };

  case "list-reminders": {
    if (state.reminders.length === 0) {
      return "You have no reminders.";
    }

    const now = new Date().getTime();

    return `
      <table border="1">
        <thead>
          <tr>
            <th>id</th>
            <th>seconds remaining</th>
            <th>text</th>
          </tr>
        </thead>
        <tbody>
          ${state.reminders
            .map(({ id, date, text }) => `
              <tr>
                <td>${id}</td>
                <td>${Math.round((date.getTime() - now) / 1000)}</td>
                <td>${text}</td>
              </tr>`)
            .join("")}
        </tbody>
      </table>`;
  }

  case "clear-all-reminders": {
    clearAllReminders(state);
    return "Ok, I have cleared all of your reminders.";
  }

  case "clear-reminder": {
    const reminder = state.reminders.find((r) => r.id === message.id);

    if (!reminder) {
      return `There is no reminder with id ${message.id}.`;
    }

    clearTimeout(reminder.timeout);
    state.reminders = state.reminders.filter((r) => r !== reminder);

    return `Ok, I will not remind you to ${reminder.text}.`;
  }

  case "unknown":
    return "I'm sorry, I don't understand what you mean.";
  }
}

function clearAllReminders(state: State) {
  for (const { timeout } of state.reminders) {
    clearTimeout(timeout);
  }

  state.reminders = [];
}

// Websocket wrapper

export default (ws: WebSocket) => {
  const state: State = { nextId: 1, reminders: [], ws };

  ws.on('message', (rawMessage) => {
    const message = parseMessage(rawMessage.toString());
    const reply = executeMessage(state, message);
    ws.send(reply);
  });

  ws.on('close', () => {
    clearAllReminders(state);
  });

  ws.send('Greetings, friend! Type <tt>help</tt> to get started.');
};
