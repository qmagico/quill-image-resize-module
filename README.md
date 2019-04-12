# Quill Image Resize and Rotate Module - for quill 2.0
A module for Quill rich text editor to allow images to be resized and rotated.

FORKED FROM HERE:-
https://github.com/andrewcampey/quill-image-resize-module

# Improvements over original versions:
- It is now possible to copy the image with ctrl + c
- The image selection has the same behavior of a selected character, i.e., it will be erased if something is written over over
- Alignment buttons removed, because there is already an alignment button in the toolbar and float can lead to bugged behaviors
- Rotation was improved by correctly correcting the line height if the original width is not equal to the original height
- Rotation remembers the last state even if you change selections
- Selection overlay correctly moves if the image is moved with toolbar inputs such as margin

# How to build:
npm install
npm install webpack webpack-cli --save-dev  # Don't know if this is really necessary
sudo apt install webpack
webpack -p --progress --colors  # Tirar o -p para não minificar
