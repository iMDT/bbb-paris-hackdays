# Post-Meeting Processor

1. **Transcribe audio** – forwards the raw meeting audio to the Whisper transcription API.  
2. **Summarize content** – sends the transcript, poll results, and participant details to an AI service to generate a concise summary.  
3. **Create Markdown output** – formats the summary as a Markdown document.  
4. **Append to Docs** – calls the Docs Append endpoint, providing the target document URL along with the generated Markdown payload.  


Repository link: https://github.com/bigbluebutton/bbb-playback-transcript