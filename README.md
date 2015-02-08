Development in progress, the status is still pre beta, see [todos](https://github.com/hvoecking/retouch#todo)!

<!-- TITLE/ -->

# Retouch - Ergonomic Image Editor

<!-- /TITLE -->


<!-- BADGES/ -->

<br/>


<!-- /BADGES -->


<!-- DESCRIPTION/ -->

A tool to efficiently crop, straighten, and retouch images.

<!-- /DESCRIPTION -->


Open a file, make it awesome and save the result.

Works offline.

# Install
The build process is managed by gulp.
To run retouch without installing anything globally do:

(it is assumed that node >=0.10 and npm are already installed on the system)
```bash
git clone https://github.com/hvoecking/retouch.git
cd retouch
npm install
./node_modules/bower/bin/bower install
./node_modules/gulp/bin/gulp.js watch
```
The app can only properly run as a chrome extension.
Open chrome, go to the [extensions](chrome://extensions) page, tick `Developer mode` click `Load unpacked extension` select `retouch/dist/debug` directory and enjoy auto reload.

There are 3 build modi for gulp, next to the default `debug` mode you can call gulp like this:
```bash
./node_modules/gulp/bin/gulp.js watch {watch,clean,…} [--build {test,release}]
```
The output files are then produced in their corresponding subdirectory of the `retouch/dist/` directory.

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
  - [ ] Open directories and step through images
  - [ ] Save original as backup
  - [ ] Save applied changes in exif data
  - [ ] Sort by Name, File date, exif date, type, size, etc...
  - [ ] \(Show other photos in the directory as mini gallery\)
- [ ] Support more image types
- [ ] \(Read/write exif data\)
- [ ] Deploy to chrome webstore, version 1.0

<!-- HISTORY/ -->

## History
[Discover the change history by heading on over to the `HISTORY.md` file.](https://github.com/hvoecking/retouch/blob/master/HISTORY.md#files)

<!-- /HISTORY -->


<!-- LICENSE/ -->

## License

Licensed under [BSD-style](https://github.com/hvoecking/retouch/blob/master/LICENSE.md)

Copyright &copy; Heye Vöcking <heye.voecking+retouch@gmail.com>

<!-- /LICENSE -->


<!-- THE END -->
