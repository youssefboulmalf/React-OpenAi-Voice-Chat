import React, { useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import css from "./Microphone.module.css";

const maleVoices = [
  "Google UK English Male",
  "Google US English Male",
  "Microsoft David Desktop - English (United States)",
  "Microsoft David Desktop - English (United Kingdom)",
];
let hasSpoken = false;
let isSpeaking = false;
let messageSend = false;
const msg = new SpeechSynthesisUtterance();
msg.lang = "en-US";
const voices = window.speechSynthesis
  .getVoices()
  .find(({ name }) => maleVoices.includes(name));
msg.voice = voices;

const Microphone = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [chatResponse, setChatResponse] = useState("");

  const speechHandler = (msg) => {
    console.log(chatResponse);
    msg.text = chatResponse;
    window.speechSynthesis.speak(msg);
  };

  const reset = () => {
    resetTranscript();
    hasSpoken = false;
    messageSend = false;
    setChatResponse("");
  };

  async function askGpt(question) {
    console.log("sending to gpt");
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer YourApiKeyHere`,
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: question,
        max_tokens: 1000,
        temperature: 0,
      }),
    });
    const json = await response.json();
    setChatResponse(json.choices[0].text);
  }

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }
  if (!listening && !messageSend && transcript.length > 0) {
    console.log("Ask gpt3: " + transcript);
    messageSend = true;
    askGpt(transcript);
  }

  if (chatResponse.length > 0 && !isSpeaking && !hasSpoken) {
    isSpeaking = true;
    console.log("Speaking");
    speechHandler(msg);
    isSpeaking = false;
    hasSpoken = true;
  }

  return (
    <div className={css.microphone}>
      <div className={css.state}>
      <p>Microphone: {listening ? "on" : "off"}</p>
      </div>
      <div className={css.buttons}>
        <button
          onClick={() => {
            if(hasSpoken){
              reset()
            }
            SpeechRecognition.startListening({ language: "en-US" });
          }}
        >
          Ask question
        </button>
        <button onClick={SpeechRecognition.stopListening}>Stop listening</button>
        <button onClick={() => reset()}>Reset</button>
      </div>
      <p className={css.transcript}>{transcript}</p>
      <div className={css.terminal}>
        <p className={css.chatIntro}>{"chatGPT3> "}</p>
        <p className={css.response}>{chatResponse}</p>
      </div>
    </div>
  );
};
export default Microphone;
