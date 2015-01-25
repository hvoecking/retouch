Development in progress, the status is still pre beta, see [todos](https://github.com/hvoecking/retouch#todo)!

# Retouch - Ergonomic Image Editor
A tool to efficiently crop, straighten, and retouch images.

Open files, perform a simple modifications and save the result.

Works offline.

# Install
The buildprocess is managed by gulp.
To install it without installing packages globally do:

```
git clone https://github.com/hvoecking/retouch.git
cd retouch
npm install
node node_modules/bower/bin/bower.js install
node node_modules/gulp/bin/gulp.js watch --build test
```
The app can only properly run as a chrome extension.
Open chrome, go to [extensions](chrome://extensions), tick `Developer mode` click `Load unpacked extension` select `retouch/dist` directory and enjoy auto reload.

# TODO:
- [x] Basic image reading, displaying, writing
- [ ] Save as jpeg with compression
- [ ] Add crop functionality
- [ ] Add straighten functionality
- [ ] Add bezier curve functionality
- [ ] Ui design
  - [ ] Dynamically resize canvas to maximum available space
  - [ ] Restyle navigation buttons
  - [ ] Restyle filters, use tabs or something simialar
- [ ] Keyboard shortcuts
- [ ] Directory mode
  - [x] Open directories and step through images
  - [ ] Save original as backup
  - [ ] Save applied changes in exif data
  - [ ] Sort by Name, File date, exif date, type, size, etc...
  - [ ] \(Show other photos in the directory as mini gallery\)
- [ ] Support more image types
- [ ] \(Read/write exif data\)
- [ ] Deploy to chrome webstore, version 1.0
