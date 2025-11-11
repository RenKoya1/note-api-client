# note-api-client

[![Version badge](https://img.shields.io/github/v/release/RenKoya1/note-api-client?include_prereleases)](https://github.com//RenKoya1/note-api-client)
[![npm version](https://img.shields.io/npm/v/note-api-client)](https://www.npmjs.com/package/note-api-client)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**note-api-client** is a comprehensive **Node.js and TypeScript library** for interacting with the **note.com API**. Build powerful integrations, automate content management, and access note.com's rich features programmatically with ease.

## ✨ Features

- 🔍 **Search & Discovery**: Search notes by keyword, username, category, and hashtag
- 📝 **Content Management**: Create, edit, and manage notes programmatically
- 👥 **User Operations**: Fetch user profiles, followers, followings, and user content
- 📰 **Magazine Support**: Access and search magazine content
- 🏷️ **Hashtag & Category**: Browse trending hashtags and explore categories
- 🔐 **Authentication**: Built-in sign-in support for authenticated operations
- 🖼️ **Media Upload**: Upload eyecatch images for your notes
- 💬 **Comments**: Retrieve note comments and engagement data
- 📊 **Recommendations**: Access recommended content metadata
- 🎨 **MKit Layouts**: Fetch creative layout configurations
- 🎯 **Contests**: Browse note.com contests and campaigns
- ⚡ **TypeScript First**: Full type safety and IntelliSense support
- 🚀 **Promise-based API**: Modern async/await syntax
- 📦 **Zero Config**: Works out of the box with sensible defaults

## 📦 Installation

Install via npm:

```sh
npm install note-api-client
```

Install via yarn:

```sh
yarn add note-api-client
```

Install via pnpm:

```sh
pnpm add note-api-client
```

## 🚀 Quick Start

```ts
import { NoteAPIClient } from "note-api-client";

// Initialize the client
const client = new NoteAPIClient();

// Search notes by keyword
const notes = await client.searchNotesByKeyword({
  phrase: "JavaScript",
});

// Get user's notes
const userNotes = await client.searchNotesByUsername({
  username: "your_username",
});

// Get note details
const noteDetail = await client.getNoteDetail({
  noteKey: "note_key_here",
});
```

## 📚 API Reference

### Search Operations

#### Search Notes by Keyword

```ts
const notes = await client.searchNotesByKeyword({
  phrase: "AI technology",
  page: 1,
});
```

#### Search Notes by Username

```ts
const userNotes = await client.searchNotesByUsername({
  username: "example_user",
  page: 1,
});
```

#### Search Notes by Category

```ts
const categoryNotes = await client.searchNotesByCategory({
  categoryName: "tech",
  page: 1,
});
```

#### Search Notes by Hashtag

```ts
const hashtagNotes = await client.searchNotesByHashtag({
  hashtag: "programming",
  page: 1,
});
```

### Content Management

#### Create Note

```ts
const newNote = await client.createNote({
  title: "My First Note",
  body: "This is the content of my note.",
});
```

#### Edit Note

```ts
const updatedNote = await client.editNote({
  noteId: "123456",
  title: "Updated Title",
  body: "Updated content",
});
```

#### Save Draft

```ts
const draft = await client.saveDraft({
  title: "Draft Title",
  body: "Draft content",
});
```

### User Operations

#### Search Users by Keyword

```ts
const users = await client.searchUsersByKeyword({
  phrase: "developer",
  page: 1,
});
```

#### Search User by Username

```ts
const user = await client.searchUserByUsername({
  username: "example_user",
});
```

#### Get Followers

```ts
const followers = await client.getFollowers({
  username: "example_user",
  page: 1,
});
```

#### Get Followings

```ts
const followings = await client.getFollowings({
  username: "example_user",
  page: 1,
});
```

### Magazine Operations

#### Search Magazines by Keyword

```ts
const magazines = await client.searchMagazinesByKeyword({
  phrase: "technology",
  page: 1,
});
```

#### Get Magazine Details

```ts
const magazine = await client.getMagazineDetail({
  magazineKey: "magazine_key_here",
});
```

### Hashtag & Category

#### Get Hashtags

```ts
const hashtags = await client.getHashtags();
```

#### Get Hashtag Details

```ts
const hashtagDetail = await client.getHashtagDetail({
  hashtag: "nodejs",
});
```

#### Get Categories

```ts
const categories = await client.getCategories();
```

### Authentication

#### Sign In

```ts
const session = await client.signIn({
  login: "your_email@example.com",
  password: "your_password",
  g_recaptcha_response: "",
  redirect_path: "/",
});
```

### Media & Assets

#### Upload Eyecatch Image

```ts
const eyecatch = await client.uploadEyecatch({
  imageData: buffer,
  filename: "image.jpg",
});
```

### Engagement

#### Get Comments

```ts
const comments = await client.getComments({
  noteKey: "note_key_here",
  page: 1,
});
```

### Additional Features

#### Get Recommended Metadata

```ts
const recommendations = await client.getRecommendMetadata();
```

#### Get MKit Layouts

```ts
const layouts = await client.getMkitLayouts();
```

#### Get Contests

```ts
const contests = await client.getContests();
```

## 🔧 Advanced Usage

### Using Cookies for Authentication

```ts
const client = new NoteAPIClient("your_session_cookies_here");

// Now you can perform authenticated operations
const note = await client.createNote({
  title: "Authenticated Note",
  body: "This note is created with authentication.",
});
```

### Error Handling

```ts
try {
  const notes = await client.searchNotesByKeyword({ phrase: "test" });
  console.log(notes);
} catch (error) {
  console.error("Error fetching notes:", error);
}
```

## 🛠️ Requirements

- **Node.js**: >= 20.0.0
- **TypeScript**: 4.0+ (for TypeScript projects)

## 📖 Use Cases

- **Content Automation**: Automatically publish and manage notes
- **Analytics Tools**: Build dashboards to track note performance
- **Social Media Integration**: Cross-post content to note.com
- **Content Aggregation**: Collect and curate notes by topic
- **Research Tools**: Analyze trending topics and hashtags
- **Bot Development**: Create interactive bots for note.com
- **Data Migration**: Move content to/from note.com
- **Personal Automation**: Schedule and manage your writing workflow

## 🤝 Contributing

Contributions are welcome! We appreciate your help in making this library better.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [npm Package](https://www.npmjs.com/package/note-api-client)
- [GitHub Repository](https://github.com/RenKoya1/note-api-client)
- [Issue Tracker](https://github.com/RenKoya1/note-api-client/issues)
- [note.com Official Site](https://note.com)

## 🌟 Show Your Support

If you find this library useful, please consider giving it a ⭐ on GitHub!

## 📧 Contact

For questions, suggestions, or feedback, please open an issue on GitHub.

---

**Keywords**: note.com, note-api, note api client, nodejs note, typescript note, note.com api, note automation, content management, japanese blogging platform, note sdk, note library
