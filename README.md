# GuelDrive v0.2.1

Home media streaming application using Node.js.

## Required
A directory `setup` in the same directory as `gueldrive.js` with a file `setup.json` similar to the following:
```$xslt
{
  "host": "127.0.0.1",
  "port": 1337,
  "videoDirectory": "./Videos/",
  "moviesFolder": "Movies/",
  "tvShowsFolder": "TVShows/"
}
```

## Dependencies

- Node.js: ^4.3.0
- Socket.io: (See package.json)
- Express: (See package.json)

## License

GuelDrive is available under the MIT license, included in LICENSE.txt. 
