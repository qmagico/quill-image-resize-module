# Quill Image Resize and Rotate Module
A module for Quill rich text editor to allow images to be resized and rotated.

FORKED FROM HERE:-
https://github.com/kensnyder/quill-image-drop-module

This repo is just me adding rotate to it.
Changes:-

- Added buttons to the current align tool bar
- Added name so I can track when rotate buttons are clicked (They can be clicked repeatedly)
- Added basic function to check where the image was in the rotation cycle.
- Used the quill Undo and Redo buttons as my buttons.
- It only requires the Toolbar.js file to be modified.




Need to use it in Angular? Shout out to https://github.com/viniciusaugutis for this comment:-
https://github.com/kensnyder/quill-image-resize-module/issues/27#issuecomment-392150578

People who are having difficulty using the quill image resize module with ANGULAR-CLI and ANGULAR 2+
Here's a way to not have to tinker with the webpack.config.ts file

terminal

npm install quill --save
npm install quill-image-resize-module --save
angular-cli.json

"scripts": [
        ...,
        "../node_modules/quill/dist/quill.min.js"
 ]
Componente.ts

import * as QuillNamespace from 'quill';
let Quill: any = QuillNamespace;
import ImageResize from 'quill-image-resize-module';
Quill.register('modules/imageResize', ImageResize);

this.editor_modules = {
      toolbar: {
        container: [
          [{ 'font': [] }],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'header': 1 }, { 'header': 2 }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'align': [] }],
          ['link', 'image']
        ]
      },
      imageResize: true
    };

Component.html
<quill-editor [modules]="editor_modules" [(ngModel)]="content"></quill-editor>

