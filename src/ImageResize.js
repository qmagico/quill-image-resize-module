import defaultsDeep from 'lodash/defaultsDeep';
import DefaultOptions from './DefaultOptions';
import { DisplaySize } from './modules/DisplaySize';
import { Toolbar } from './modules/Toolbar';
import { Resize } from './modules/Resize';

const knownModules = { DisplaySize, Toolbar, Resize };
const Parchment = window.Quill.imports.parchment

/**
 * Custom module for quilljs to allow user to resize <img> elements
 * (Works on Chrome, Edge, Safari and replaces Firefox's native resize behavior)
 * @see https://quilljs.com/blog/building-a-custom-module/
 */
export default class ImageResize {

    constructor(quill, options = {}) {
        // save the quill reference and options
        this.quill = quill;

        // Apply the options to our defaults, and stash them for later
        // defaultsDeep doesn't do arrays as you'd expect, so we'll need to apply the classes array from options separately
        let moduleClasses = false;
        if (options.modules) {
            moduleClasses = options.modules.slice();
        }

        // Apply options to default options
        this.options = defaultsDeep({}, options, DefaultOptions);

        // (see above about moduleClasses)
        if (moduleClasses !== false) {
            this.options.modules = moduleClasses;
        }

        // disable native image resizing on firefox
        document.execCommand('enableObjectResizing', false, 'false');

        // respond to clicks inside the editor
        this.quill.root.addEventListener('click', this.handleClick, false);

        this.quill.root.parentNode.style.position = this.quill.root.parentNode.style.position || 'relative';

        // setup modules
        this.moduleClasses = this.options.modules;

        this.modules = [];
    }

    initializeModules = () => {
        let that = this;
        this.removeModules();

        this.modules = this.moduleClasses.map(
            ModuleClass => new (knownModules[ModuleClass] || ModuleClass)(this),
        );

        this.modules.forEach(
            (module) => {
                module.onCreate(that);
            },
        );

        this.onUpdate();
    };

    onUpdate = () => {
        this.repositionElements();
        this.modules.forEach(
            (module) => {
                module.onUpdate();
            },
        );
    };

    removeModules = () => {
        this.modules.forEach(
            (module) => {
                module.onDestroy();
            },
        );

        this.modules = [];
    };

    handleClick = (evt) => {
        if (evt.target && evt.target.tagName && evt.target.tagName.toUpperCase() === 'IMG') {
            if (this.img === evt.target) {
                // we are already focused on this image
                return;
            }
            if (this.img) {
                // we were just focused on another image
                this.hide();
            }
            // clicked on an image inside the editor
            this.show(evt.target);
        } else if (this.img) {
            // clicked on a non image
            this.hide();
        }
    };

    show = (img) => {
        // keep track of this img element
        this.img = img;

        this.showOverlay();

        this.initializeModules();
    };

    showOverlay = () => {
        if (this.overlay) {
            this.hideOverlay();
        }

        // prevent spurious text selection
        this.setUserSelect(this.img);

        const image_blot = Parchment.Registry.find(this.img);
        const indexSelectedImage = this.quill.getIndex(image_blot);
        this.quill.setSelection(indexSelectedImage, 0, 'silent');

        // listen for the image being deleted or moved
        this.quill.root.addEventListener('keyup', this.checkImage, true);
        this.quill.root.addEventListener('input', this.checkImage, true);
        this.quill.root.addEventListener('keydown', this.selectImage, true);
        this.quill.on('text-change', this.repositionElements, true);

        // Create and add the overlay
        this.overlay = document.createElement('div');
        Object.assign(this.overlay.style, this.options.overlayStyles);

        this.quill.root.parentNode.appendChild(this.overlay);

        this.repositionElements();
    };

    selectImage = (evt) => {
        if (this.img) {
            const image_blot = Parchment.Registry.find(this.img);
            const indexSelectedImage = this.quill.getIndex(image_blot);
            this.quill.setSelection(indexSelectedImage, 1, 'silent');
        }
    }

    hideOverlay = () => {
        if (!this.overlay) {
            return;
        }

        this.img = undefined;
        // Remove the overlay
        this.quill.root.parentNode.removeChild(this.overlay);
        this.overlay = undefined;

        // stop listening for image deletion or movement
        this.quill.root.removeEventListener('keyup', this.checkImage);
        this.quill.root.removeEventListener('input', this.checkImage);
        this.quill.root.removeEventListener('keydown', this.selectImage);
        this.quill.off('text-change', this.repositionElements);

        // reset user-select
        this.setUserSelect('');
    };

    repositionElements = () => {
        if (!this.overlay || !this.img) {
            return;
        }

        // position the overlay over the image
        const parent = this.quill.root.parentNode;
        const imgRect = this.img.getBoundingClientRect();
        const containerRect = parent.getBoundingClientRect();

        Object.assign(this.overlay.style, {
            left: `${imgRect.left - containerRect.left - 1 + parent.scrollLeft}px`,
            top: `${imgRect.top - containerRect.top + parent.scrollTop}px`,
            width: `${imgRect.width}px`,
            height: `${imgRect.height}px`,
        });
    };

    hide = () => {
        this.hideOverlay();
        this.removeModules();
        this.img = undefined;
    };

    setUserSelect = (value) => {
        [
            'userSelect',
            'mozUserSelect',
            'webkitUserSelect',
            'msUserSelect',
        ].forEach((prop) => {
            // set on contenteditable element and <html>
            this.quill.root.style[prop] = value;
            document.documentElement.style[prop] = value;
        });
    };

    checkImage = (evt) => {
        if (this.img) {
            var model = this;
            setTimeout(function(){
                model.repositionElements();
            });
            
            if ([16, 17, 18].indexOf(evt.keyCode) >= 0) {  // alt, shift and ctrl
                // Unselect image but keep cursor close
                const image_blot = Parchment.Registry.find(this.img);
                const indexSelectedImage = this.quill.getIndex(image_blot);
                this.quill.setSelection(indexSelectedImage, 0, 'silent');
                return;
            }
            if (evt.keyCode == 46 || evt.keyCode == 8) {  // 46 = delete, 8 = backspace
                var img_blot = window.Quill.find(this.img);
                if (img_blot) {
                    img_blot.deleteAt(0);
                }
            }
            this.hide();
        }
    };
}

if (window.Quill) {
    window.Quill.register('modules/imageResize', ImageResize);
}
