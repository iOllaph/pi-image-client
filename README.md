Got it! Let’s write a clear **README** for your `pi-image-client` project based on this WebSocket image-to-printer setup. Here's a professional, minimal version that explains setup, usage, and configuration:

---

# Pi Image Client

A lightweight Node.js client that connects to a WebSocket server, receives Base64-encoded images, saves them locally, and prints them to a connected thermal printer (e.g., Brother QL-800) on a Raspberry Pi or Linux device.

---

## Features

* Receives image print jobs via WebSocket.
* Saves Base64 images temporarily to `/tmp`.
* Sends images directly to a thermal printer using `lp`.
* Sends job status back to the server.
* Automatic cleanup of temporary files.

---

## Requirements

* Node.js 18+
* Linux-based system (Raspberry Pi recommended)
* Installed printer (`lp` command available)
* Printer configured and accessible via `lp -d <printer_name>`

---

## Installation

```bash
# Clone the repository
git clone https://github.com/iOllaph/pi-image-client.git
cd pi-image-client

# Install dependencies
npm install
```

---

## Configuration

Edit `index.js` to set your WebSocket server and printer:

```js
const RELAY_WS_URL = "wss://your-websocket-server";
const TEMP_DIR = "/tmp"; // temporary folder for images
const PRINTER_NAME = "Brother_QL-800"; // your printer name
```

---

## Usage

Start the client:

```bash
node index.js
```

* On receiving an image, the client will:

  1. Save it as a temporary PNG file.
  2. Send it to the printer using `lp`.
  3. Delete the temporary file.
  4. Send the job result back to the WebSocket server.

Example server message format:

```json
{
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA..."
}
```

---

## Notes

* The client automatically reconnects if the WebSocket closes.
* Ensure the printer name in `PRINTER_NAME` matches your system configuration.
* Temporary files are stored in `/tmp` and automatically deleted after printing.

---