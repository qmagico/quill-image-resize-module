import IconAlignLeft from 'quill/assets/icons/align-left.svg';
import IconAlignCenter from 'quill/assets/icons/align-center.svg';
import IconAlignRight from 'quill/assets/icons/align-right.svg';
import IconUndo from 'quill/assets/icons/undo.svg'
import IconRedo from 'quill/assets/icons/redo.svg'
import Delta from 'quill-delta';

import { BaseModule } from './BaseModule';

const classAttributor = window.Quill.imports.parchment.ClassAttributor;

const RotateImageClass = new classAttributor('class', 'rot');

export class Toolbar extends BaseModule {
	rotation = 0;

    onCreate = (that) => {
    	if (this.img.classList[0] == 'rot-90rotate') this.rotation = 90;
		else if (this.img.classList[0] == 'rot-180rotate') this.rotation = 180;
		else if (this.img.classList[0] == 'rot-minus90rotate') this.rotation = -90;
		// Setup Toolbar
        this.toolbar = document.createElement('div');
        Object.assign(this.toolbar.style, this.options.toolbarStyles);
        this.overlay.appendChild(this.toolbar);
        this.quill = that.quill;

        // Setup Buttons
        this._definerotations();
        this._addToolbarButtons();
    };

	// The toolbar and its children will be destroyed when the overlay is removed
    onDestroy = () => {};

	// Nothing to update on drag because we are are positioned relative to the overlay
    onUpdate = () => {};

    _definerotations = () => {
		this.rotationvalue = '';

        this.rotations = [
			{
				name: 'rotate-left',
				icon: IconUndo,
                apply: () => {
					this.rotationvalue = this._setRotation('left');

					// Adds a class of rot-<<rotationvalue>>
					RotateImageClass.add(this.img, this.rotationvalue);
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
                },
                isApplied: () => { },
			},

        ];
    };

    _addToolbarButtons = () => {
		const buttons = [];
		this.rotations.forEach((rot, idx) => {
			const button = document.createElement('span');
			button.setAttribute('title', rot.name);
			buttons.push(button);
			button.innerHTML = rot.icon;
			button.addEventListener('click', () => {
				//this._selectButton(button);
				rot.apply();
				// image may change position; redraw drag handles
				this.requestUpdate();

				// Tell quill that something has changed
		        const editor_length = this.quill.getLength();
		        this.quill.updateContents(new Delta().retain(editor_length - 1).insert(' '), 'user');
		        const that = this;
		        setTimeout(function(){
		            that.quill.updateContents(new Delta().retain(editor_length - 1).delete(1), 'user');
		        });
			});
			Object.assign(button.style, this.options.toolbarButtonStyles);
			if (idx > 0) {
				button.style.borderLeftWidth = '0';
			}
			Object.assign(button.children[0].style, this.options.toolbarButtonSvgStyles);
			if (rot.isApplied()) {
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
			return '';
		} else {
			return '';
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
