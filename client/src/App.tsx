import React, { FormEvent, useEffect, useState } from 'react';
import { makeStyles, Container, Grid, Paper, TextField, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: theme.spacing(4, 0),
    padding: theme.spacing(3),
  },
}));

interface Message {
  speaker: "user" | "bot";
  text: string;
}

export default () => {
  const classes = useStyles();
  const [text, setText] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const wsURL = window.location.origin
      .replace('http', 'ws')
      .replace(':7777', ':5555');

    const ws = new WebSocket(wsURL);

    ws.onopen = () => {
      setWs(ws);
    };

    ws.onclose = () => {
      setWs(null);
      setMessages((messages) => [...messages, { speaker: 'bot', text: 'Connection lost. Goodbye!' }]);
    };

    ws.onmessage = (event) => {
      setMessages((messages) => [...messages, { speaker: 'bot', text: `${event.data}` }]);
    };

    return () => {
      ws.close();
    }
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (text === "" || ws === null) {
      return;
    }

    ws.send(text);

    setMessages((messages) => [...messages, { speaker: 'user', text }]);
    setText("");
  };

  return (
    <Container maxWidth="sm">
      <Paper className={classes.paper} elevation={3}>
        <Grid container spacing={3}>

          <Grid item xs={12}>
            <Typography variant="h5">Replicant Chatbot Challenge</Typography>
          </Grid>

          <Grid item xs={12}>
            <form onSubmit={submit}>
              <TextField
                fullWidth
                variant="outlined"
                disabled={ws === null}
                value={text}
                onChange={(event) => setText(event.target.value)}
              />
            </form>
          </Grid>

          {messages.length > 0 && (
            <Grid item xs={12}>
              <Grid container spacing={1}>
                {messages.map(({ speaker, text }, idx) => (
                  <Grid item xs={12} key={idx}>
                    {speaker === "user" ? (
                      <Typography variant="body1">
                        <b>You: </b>
                        {text}
                      </Typography>
                    ) : (
                      <Typography variant="body1">
                        <b>Bot: </b>
                        <span dangerouslySetInnerHTML={{ __html: text }}/>
                      </Typography>
                    )}
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}

        </Grid>
      </Paper>

    </Container>
  );
};
