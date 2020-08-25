import 'modals/confirm_modal.scss';

import m from 'mithril';
import $ from 'jquery';
import app from 'state';
import { Button } from 'construct-ui';

const ConfirmModal = {
  confirmExit: async () => true,
  view: (vnode) => {
    const confirmText = vnode.attrs.prompt || 'Are you sure?';
    const [primaryButton, secondaryButton] = vnode.attrs.buttons;
    return m('.ConfirmModal', [
      m('.compact-modal-body', [
        m('h3', confirmText),
      ]),
      m('.compact-modal-actions', [
        m(Button, {
          intent: 'primary',
          onclick: (e) => {
            e.preventDefault();
            $(vnode.dom).trigger('modalcomplete');
            setTimeout(() => {
              $(vnode.dom).trigger('modalexit');
            }, 0);
          },
          oncreate: (vvnode) => {
            $(vvnode.dom).focus();
          },
          label: primaryButton || 'Yes',
        }),
        m(Button, {
          intent: 'none',
          onclick: (e) => {
            e.preventDefault();
            $(vnode.dom).trigger('modalexit');
          },
          label: secondaryButton || 'Cancel',
        }),
      ]),
    ]);
  }
};

export const confirmationModalWithText = (prompt: string, buttons?: string[]) => {
  return async () : Promise<boolean> => {
    let confirmed = false;
    return new Promise((resolve) => {
      app.modals.create({
        modal: ConfirmModal,
        data: { prompt, buttons },
        completeCallback: () => { confirmed = true; },
        exitCallback: () => resolve(confirmed)
      });
    });
  };
};

export default ConfirmModal;
