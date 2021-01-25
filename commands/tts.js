var player = require('play-sound')(opts = {});
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const client = new textToSpeech.TextToSpeechClient();

async function quickStart(message) {
  // The text to synthesize
  const text = message;

  // Construct the request
  const request = {
    input: {text: text},
    // Select the language and SSML voice gender (optional)
    voice: {languageCode: 'pt-BR', ssmlGender: 'NEUTRAL'},
    // select the type of audio encoding
    audioConfig: {audioEncoding: 'MP3'},
  };

  // Performs the text-to-speech request
  const [response] = await client.synthesizeSpeech(request);
  // Write the binary audio content to a local file
  const writeFile = util.promisify(fs.writeFile);
  await writeFile('output.mp3', response.audioContent, 'binary');
  setTimeout(() => {
    player.play('output.mp3', function(err){
      if (err) throw err
      return;
    });
  },1000);
  console.log('Audio content written to file: output.mp3');
}

exports.default = (client, obs, mqtt, messages, botDB, commandQueue, ttsQueue) => {
    client.on('message', (target, context, message, isBot) => {
        if (isBot) return;

        let parsedMessage = message.split(" ");
        if(parsedMessage[0] === '!tts') {
          let fullMessage = message.replace("!tts ","").normalize('NFD').replace(/[\u0300-\u036f]/g, "");
          ttsQueue.push(context["display-name"] + " disse: " + fullMessage);
        }
    });
};
