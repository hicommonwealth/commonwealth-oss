import m from 'mithril';
import Infinite from 'mithril-infinite';
import app from 'state';

import { PopoverMenu, Button, Icons } from 'construct-ui';
import HeaderNotificationRow from 'views/components/sidebar/notification_row';
import { Notification } from 'models';

const sortNotifications = (n: Notification[], prop: string, prop2: string) => {
  return n.reduce((acc, obj) => {
    const key = obj[prop][prop2];
    if (!acc[key]) acc[key] = [];
    acc[key].push(obj);
    return acc;
  }, {});
};

const NotificationsDrowdownMenu: m.Component<{},{}> = {
  view: (vnode) => {
    const notifications = app.login.notifications
      ? app.login.notifications.notifications.sort((a, b) => b.createdAt.unix() - a.createdAt.unix()) : [];
    const unreadNotifications = notifications.filter((n) => !n.isRead).length;
    const sortedNotifications = sortNotifications(notifications, 'subscription', 'objectId');

    return m(PopoverMenu, {
      transitionDuration: 0,
      hoverCloseDelay: 0,
      trigger: m(Button, {
        iconLeft: Icons.BELL,
      }),
      position: 'bottom-end',
      closeOnContentClick: true,
      menuAttrs: {
        align: 'left',
      },
      class: 'notification-menu',
      content: m('.notification-list', [
        notifications.length > 0
          ? m(Infinite, {
            maxPages: 8,
            pageData: () => notifications,
            item: (data, opts, index) => m(HeaderNotificationRow, { notification: data }),
          })
          : m('li.no-notifications', 'No Notifications'),
      ]),
    });
  },
};

export default NotificationsDrowdownMenu;
