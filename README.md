# note-api-client

[![Version badge](https://img.shields.io/github/v/release/RenKoya1/note-api-client?include_prereleases)](https://github.com//RenKoya1/note-api-client)
[![npm version](https://img.shields.io/npm/v/note-api-client)](https://www.npmjs.com/package/note-api-client)

A Node.js/TypeScript client for accessing the note.com API easily.

## Installation

```sh
npm install note-api-client

```

## Usage Example

```ts
import { NoteAPIClient } from "note-api-client";
const client = new NoteAPIClient();

// Get Notes by username
client.searchNotesByUsername({ username: "test_usr" });

// Get Notes by Keyword
client.searchNotesByKeyword({ phrase: "AI" });
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve this project.

## License

See [LICENSE](LICENSE).
