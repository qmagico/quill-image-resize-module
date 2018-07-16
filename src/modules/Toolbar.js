import IconAlignLeft from 'quill/assets/icons/align-left.svg';
import IconAlignCenter from 'quill/assets/icons/align-center.svg';
import IconAlignRight from 'quill/assets/icons/align-right.svg';
import IconUndo from 'quill/assets/icons/undo.svg'
import IconRedo from 'quill/assets/icons/redo.svg'
import Delta from 'quill-delta';

import { BaseModule } from './BaseModule';

const Parchment = window.Quill.imports.parchment;
/*
const FloatStyle = new Parchment.Attributor.Style('float', 'float');
const MarginStyle = new Parchment.Attributor.Style('margin', 'margin');
const DisplayStyle = new Parchment.Attributor.Style('display', 'display');
*/
const ResizeImageClass = new Parchment.Attributor.Class('class', 'res');
const RotateImageClass = new Parchment.Attributor.Class('class', 'rot');

export class Toolbar extends BaseModule {
	rotation = 0;

    onCreate = () => {
		// Setup Toolbar
        this.toolbar = document.createElement('div');
        Object.assign(this.toolbar.style, this.options.toolbarStyles);
        this.overlay.appendChild(this.toolbar);

        // Setup Buttons
        this._defineAlignments();
        this._addToolbarButtons();
    };

	// The toolbar and its children will be destroyed when the overlay is removed
    onDestroy = () => {};

	// Nothing to update on drag because we are are positioned relative to the overlay
    onUpdate = () => {};

    _defineAlignments = () => {
		this.rotationvalue = '';

        this.alignments = [
            {
				name: 'alignleft',
                icon: IconAlignLeft,
                apply: () => {
					// Adds a class of img-alignleft
					ResizeImageClass.add(this.img, 'alignleft');
					/*
                    DisplayStyle.add(this.img, 'inline');
                    FloatStyle.add(this.img, 'left');
					MarginStyle.add(this.img, '0 1em 1em 0');
					*/

					// This fires off a change for the quill view
					var width = this.img.width;
					this.img.width = width + 1;
					this.img.width = width - 1;
                },
                isApplied: () => { }, // FloatStyle.value(this.img) == 'left',
            },
            {
				name: 'aligncenter',
                icon: IconAlignCenter,
                apply: () => {
					// Adds a class of img-aligncenter
					ResizeImageClass.add(this.img, 'aligncenter');
					/*
                    DisplayStyle.add(this.img, 'block');
                    FloatStyle.remove(this.img);
					MarginStyle.add(this.img, 'auto');
					*/

					// This fires off a change for the quill view
					var width = this.img.width;
					this.img.width = width - 1;
					this.img.width = width + 1;

                },
                isApplied: () => { }, // MarginStyle.value(this.img) == 'auto',
            },
            {
				name: 'alignright',
                icon: IconAlignRight,
                apply: () => {
					// Adds a class of img-alignright
					ResizeImageClass.add(this.img, 'alignright');
					/*
                    DisplayStyle.add(this.img, 'inline');
                    FloatStyle.add(this.img, 'right');
					MarginStyle.add(this.img, '0 0 1em 1em');
					*/

					// This fires off a change for the quill view
					var width = this.img.width;
					this.img.width = width - 1;
					this.img.width = width + 1;
                },
                isApplied: () => { }, // FloatStyle.value(this.img) == 'right',
			},
			{
				name: 'rotate-left',
				icon: IconUndo,
                apply: () => {
					this.rotationvalue = this._setRotation('left');

					// Adds a class of img-<<rotationvalue>>
					RotateImageClass.add(this.img, this.rotationvalue);

					// This fires off a change for the quill view
					var width = this.img.width;
					this.img.width = width - 1;
					this.img.width = width + 1;
                },
                isApplied: () => { },
			},
			{
				name: 'rotate-right',
                icon: IconRedo,
                apply: () => {
					this.rotationvalue = this._setRotation('right');

					// Adds a class of img-<<rotationvalue>>
					RotateImageClass.add(this.img, this.rotationvalue);

					// This fires off a change for the quill view
					var width = this.img.width;
					this.img.width = width - 1;
					this.img.width = width + 1;
                },
                isApplied: () => { },
			},

        ];
    };

    _addToolbarButtons = () => {
		const buttons = [];
		this.alignments.forEach((alignment, idx) => {
			const button = document.createElement('span');
			button.setAttribute('title', alignment.name);
			buttons.push(button);
			button.innerHTML = alignment.icon;
			button.addEventListener('click', () => {
					// deselect all buttons
				buttons.forEach(button => button.style.filter = '');
				if (alignment.isApplied()) {
						// If applied, unapply
					FloatStyle.remove(this.img);
					MarginStyle.remove(this.img);
					DisplayStyle.remove(this.img);
				}				else {
						// otherwise, select button and apply
					this._selectButton(button);
					alignment.apply();
				}
					// image may change position; redraw drag handles
				this.requestUpdate();
			});
			Object.assign(button.style, this.options.toolbarButtonStyles);
			if (idx > 0) {
				button.style.borderLeftWidth = '0';
			}
			Object.assign(button.children[0].style, this.options.toolbarButtonSvgStyles);
			if (alignment.isApplied()) {
					// select button if previously applied
				this._selectButton(button);
			}
			this.toolbar.appendChild(button);
		});
    };

    _selectButton = (button) => {
		if ((button.title != 'rotate-left') && (button.title != 'rotate-right')) {
			button.style.filter = 'invert(20%)';
		}
	};

	_setRotation(direction) {
		if (this.rotation == 0 && direction == 'left') {
			this.rotation = -90;
			return 'minus90rotate';
		} else if (this.rotation == -90 && direction == 'left') {
			this.rotation = 180;
			return '180rotate';
		} else if (this.rotation == 180 && direction == 'left') {
			this.rotation = 90;
			return '90rotate';
		} else if (this.rotation == 90 && direction == 'left') {
			this.rotation = 0;
			return 'zerorotate';
		} else if (this.rotation == 0 && direction == 'right') {
			this.rotation = 90;
			return '90rotate';
		} else if (this.rotation == 90 && direction == 'right') {
			this.rotation = 180;
			return '180rotate';
		} else if (this.rotation == 180 && direction == 'right') {
			this.rotation = -90;
			return 'minus90rotate';
		} else if (this.rotation == -90 && direction == 'right') {
			this.rotation = 0;
			return 'zerorotate';
		} else {
			return 'zerorotate';
		}
	}

	setUserSelect(value) {
		[
		  'userSelect',
		  'mozUserSelect',
		  'webkitUserSelect',
		  'msUserSelect'
		].forEach(prop => {
		  // set on contenteditable element and <html>
		  this.quill.root.style[prop] = value;
		  document.documentElement.style[prop] = value;
		});
	  }
}
