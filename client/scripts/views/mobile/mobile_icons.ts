/* eslint-disable max-len */
import m from
  'mithril';

export const CustomLogoutIcon = {
  view: (vnode) => {
    return m('svg.CustomLogoutIcon', {
      'width': '32',
      'height': '30',
      'viewBox': '0 0 32 30',
      'fill': 'none',
      'xmlns': 'http://www.w3.org/2000/svg'
    },
    [
      m('rect', {
        'x': '14.2297',
        'y': '1',
        'width': '15.7496',
        'height': '27.1089',
        'rx': '1',
        'stroke': '#666666',
        'stroke-width': '2'
      }),
      m('path', {
        'd': 'M21.7236 14.5549H3.0105M3.0105 14.5549L8.28034 10.0078M3.0105 14.5549L8.28034 19.1018',
        'stroke': '#666666',
        'stroke-width': '2',
        'stroke-linecap': 'round'
      })
    ]);
  }
};

export const CustomCommentIcon = {
  view: (vnode) => {
    return m('svg.CustomCommentIcon', {
      'width': '30',
      'height': '30',
      'viewBox': '0 0 30 30',
      'fill': 'none',
      'xmlns': 'http://www.w3.org/2000/svg'
    },
    m('path', {
      'd':`M1.35718 27.6246C1.35718 28.0291 1.60082 28.3937 1.97449 28.5485C2.34817 28.7033 
      2.77829 28.6177 3.06428 28.3317L8.38241 23.0136H24.8013C25.8105 23.0136 26.7785 22.6126 
      27.4922 21.899C28.2058 21.1853 28.6068 20.2173 28.6068 19.2081V5.18051C28.6068 4.17123 
      28.2058 3.20328 27.4922 2.48961L26.7851 3.19671L27.4922 2.48961C26.7785 1.77594 25.8105 
      1.375 24.8013 1.375H5.16269C4.1534 1.375 3.18546 1.77594 2.47179 2.48961C1.75811 3.20328 
      1.35718 4.17123 1.35718 5.18051V27.6246Z`,
      'stroke': '#666666',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }));
  }
};

export const CustomEyeIcon = {
  view: (vnode) => {
    return m('svg.CustomEyeIcon', {
      'width': '35',
      'height': '34',
      'viewBox': '0 0 35 34',
      'fill': 'none',
      'xmlns': 'http://www.w3.org/2000/svg'
    },
    [
      m('path', {
        'fill-rule': 'evenodd',
        'clip-rule': 'evenodd',
        'd': `M2.39893 16.9998C2.39893 16.9998 8.06559 5.6665 17.9823 5.6665C27.8989 
          5.6665 33.5656 16.9998 33.5656 16.9998C33.5656 16.9998 27.8989 28.3332 17.9823 
          28.3332C8.06559 28.3332 2.39893 16.9998 2.39893 16.9998Z`,
        'stroke': '#666666',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      m('path', {
        'fill-rule': 'evenodd',
        'clip-rule': 'evenodd',
        'd': `M17.9821 23.2913C21.4566 23.2913 24.2732 20.4746 24.2732 17.0001C24.2732 
          13.5256 21.4566 10.709 17.9821 10.709C14.5076 10.709 11.6909 13.5256 11.6909 
          17.0001C11.6909 20.4746 14.5076 23.2913 17.9821 23.2913Z`,
        'stroke': '#666666',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ]);
  }
};

export const CustomPencilIcon = {
  view: (vnode) => {
    return m('svg.CustomPencilIcon', {
      'width': '35',
      'height': '34',
      'viewBox': '0 0 35 34',
      'fill': 'none',
      'xmlns': 'http://www.w3.org/2000/svg'
    },
    [
      m('path', {
        'd': `M23.3141 7.52397L22.607 6.81689L23.3141 6.10981L25.4734 3.95066C26.645 2.77913 28.5446 2.77913 
        29.7162 3.95066L31.0326 5.2669C32.2042 6.43843 32.2042 8.33785 31.0326 9.50938L28.8732 11.6685L28.1661 
        12.3756L27.459 11.6685L23.3141 7.52397Z`,
        'stroke': '#666666',
        'stroke-width': '2'
      }),
      m('rect', {
        'x': '5.96046e-08',
        'y': '-1.41423',
        'width': '7.86152',
        'height': '25.4464',
        'transform': 'matrix(0.707099 0.707114 -0.7071 0.707114 21.363 8.0604)',
        'stroke': '#666666',
        'stroke-width': '2'
      }),
      m('path', {
        'd': `M3.68535 32.434C3.37176 32.481 3.0545 32.3764 2.83029 32.1521C2.60608 31.9279 2.50149 31.6106 
        2.54841 31.297L3.27772 26.4228C3.33359 26.0493 3.59502 25.7392 3.9536 25.621C4.31218 25.5028 4.70677 
        25.5966 4.97375 25.8636L9.1183 30.0085C9.38528 30.2755 9.47912 30.6701 9.36091 31.0287C9.24271 31.3873 
        8.93261 31.6488 8.5592 31.7047L3.68535 32.434Z`,
        'stroke': '#666666',
        'stroke-width': '2',
        'stroke-linejoin': 'round'
      })
    ]);
  }
};

export const CustomUserIcon = {
  view: (vnode) => {
    return m('svg.CustomUserIcon', {
      'width': '35',
      'height': '34',
      'viewBox': '0 0 35 34',
      'fill': 'none',
      'xmlns': 'http://www.w3.org/2000/svg'
    },
    [
      m('path', {
        'd': `M31.3265 32.954V23.1309C31.3265 19.8172 28.6402 17.1309 25.3265 17.1309H10.6379C7.32423 17.1309 
        4.63794 19.8172 4.63794 23.1309V32.954`,
        'stroke': '#666666',
        'stroke-width': '2'
      }),
      m('circle', {
        'cx': '17.9471',
        'cy': '9.55009',
        'r': '7.50419',
        'stroke': '#666666',
        'stroke-width': '2'
      })
    ]);
  }
};

export const CustomBellIcon = {
  view: (vnode) => {
    return m('svg.CustomBellIcon', {
      'viewBox': '0 0 35 38',
      'xmlns': 'http://www.w3.org/2000/svg'
    },
    [
      m('mask', {
        'id': 'a',
        'x': '2.26489',
        'y': '0',
        'width': '31',
        'height': '38',
        'fill': 'black',
        'maskUnits': 'userSpaceOnUse'
      },
      [
        m('rect', {
          'x': '2.2649',
          'width': '31',
          'height': '38',
          'fill': '#fff'
        }),
        m('path', {
          'd': `m19.528 3.5453c-1e-4 -0.85348-0.692-1.5453-1.5455-1.5453s-1.5454 0.69186-1.5455 
          1.5453v1.5e-4 1.673c-4.3858 0.73561-7.7278 4.5499-7.7278 9.1448l2.5e-4 0.068v5.3597c0 
          3.0993-1.1374 6.0907-3.1964 8.4071-0.558 0.6278-0.11237 1.6201 0.72754 
          1.6201h7.3688v3e-4h8.7455v-3e-4h7.3692c0.8399 0 1.2856-0.9923 
          0.7276-1.6201-2.0591-2.3164-3.1964-5.3078-3.1964-8.4071v-5.4279h-3e-4c-1e-4 
          -4.5945-3.3416-8.4085-7.727-9.1445v-1.6731-1.5e-4zm-1.5458 32.455c-2.5605 
          0-4.6363-2.0756-4.6365-4.636h9.2729c-2e-4 2.5604-2.0759 4.636-4.6364 4.636z`,
          'clip-rule': 'evenodd',
          'fill-rule': 'evenodd'
        })
      ]),
      m('path', {
        'd': `m19.528 3.5453h2v-1.9e-4l-2 1.9e-4zm-3.091 0l-2-1.9e-4v1.9e-4h2zm0 1.6732l0.3309 1.9724 
          1.6691-0.27995v-1.6925h-2zm-7.7278 9.1448h-2l3e-5 0.0072 2-0.0072zm2.5e-4 0.068h2.0001l-1e-4 
          -0.0072-2 0.0072zm-3.1964 13.767l-1.4948-1.3287 1.4948 1.3287zm8.0963 1.6201l1.8854 0.6675 
          0.9443-2.6675h-2.8297v2zm0 3e-4l-1.8854-0.6675-0.9443 2.6675h2.8297v-2zm8.7455 0v2h2.82l-0.9324-2.6613-1.8876 
          0.6613zm0-3e-4v-2h-2.82l0.9325 2.6613 1.8875-0.6613zm8.0968-1.6201l-1.4949 1.3287 
          1.4949-1.3287zm-3.1964-13.835h2v-2h-2v2zm-3e-4 0h-2l1e-4 2h1.9999v-2zm-7.727-9.1445h-2v1.6923l1.669 
          0.28008 0.331-1.9724zm-6.1823 26.145v-2h-2.0002l2e-4 2.0001 2-1e-4zm9.2729 0l2 1e-4 2e-4 
          -2.0001h-2.0002v2zm-4.6361-27.364c-0.251 0-0.4545-0.20347-0.4545-0.45447l4-3.8e-4c-2e-4 
          -1.958-1.5875-3.5452-3.5455-3.5452v4zm0.4545-0.45447c0 0.251-0.2035 0.45447-0.4545 
          0.45447v-4c-1.958 0-3.5453 1.5872-3.5455 3.5452l4 3.8e-4zm0-4e-5v-1e-5 -1e-5 -1e-5 -1e-5 
          -1e-5 -1e-5 -1e-5 -1e-5 -1e-5 -1e-5 -1e-5 -1e-5 -1e-5 -1e-5 -1e-5h-4v1e-5 1e-5 1e-5 1e-5 
          1e-5 1e-5 1e-5 1e-5 1e-5 1e-5 1e-5 1e-5 1e-5 1e-5 1e-5h4zm0 1.673v-1.673h-4v1.673h4zm-7.7278 
          9.1448c0-3.6019 2.6203-6.5957 6.0587-7.1724l-0.6617-3.9449c-5.3333 0.89452-9.397 5.5294-9.397 
          11.117h4zm2e-4 0.0608l-2e-4 -0.068-4 0.0144 2.4e-4 0.068 4-0.0144zm0 5.3669v-5.3597h-4v5.3597h4zm-3.7015 
          9.7358c2.3844-2.6825 3.7015-6.1467 3.7015-9.7358h-4c0 2.6094-0.9576 5.1281-2.6912 7.0784l2.9896 
          2.6574zm-0.76728-1.7086c0.88578 0 1.3558 1.0466 0.76728 1.7086l-2.9896-2.6574c-1.7045 1.9175-0.34324 
          4.9488 2.2224 4.9488v-4zm7.3688 0h-7.3688v4h7.3688v-4zm1.8853 2.6677l1e-4 -2e-4 -3.7707-1.3349-1e-4 2e-4 
          3.7707 1.3349zm6.8602-2.6674h-8.7455v4h8.7455v-4zm-1.8875 2.661v3e-4l3.7751-1.3226-1e-4 -3e-4 -3.775 
          1.3226zm9.2567-2.6613h-7.3692v4h7.3692v-4zm-0.7673 1.7086c-0.5884-0.662-0.1185-1.7086 0.7673-1.7086v4c2.5656 
          0 3.9269-3.0313 2.2224-4.9488l-2.9897 2.6574zm-3.7015-9.7358c0 3.5891 1.3171 7.0533 3.7015 
          9.7358l2.9897-2.6574c-1.7336-1.9503-2.6912-4.469-2.6912-7.0784h-4zm0-5.4279v5.4279h4v-5.4279h-4zm1.9997 
          2h3e-4v-4h-3e-4v4zm-8.058-9.172c3.438 0.57695 6.058 3.5706 6.058 7.172l4-1e-4c-1e-4 
          -5.5874-4.0632-10.222-9.396-11.117l-0.662 3.9448zm-1.669-3.6456v1.6731h4v-1.6731h-4zm0-1.5e-4v1e-5 1e-5 
          1e-5 1e-5 1e-5 1e-5 1e-5 1e-5 1e-5 1e-5 1e-5 1e-5 1e-5 1e-5 1e-5h4v-1e-5 -1e-5 -1e-5 -1e-5 -1e-5 -1e-5 
          -1e-5 -1e-5 -1e-5 -1e-5 -1e-5 -1e-5 -1e-5 -1e-5 -1e-5h-4zm-6.1823 27.819c3e-4 3.665 2.9714 6.6359 6.6365 
          6.6359v-4c-1.456 0-2.6364-1.1803-2.6365-2.6362l-4 3e-4zm11.273-2.0001h-9.2729v4h9.2729v-4zm-4.6364 8.636c3.665 
          0 6.6361-2.9709 6.6364-6.6359l-4-3e-4c-1e-4 1.4559-1.1805 2.6362-2.6364 2.6362v4z`,
        'fill': '#666',
        'mask': 'url(#a)'
      })
    ]);
  }
};

export const CustomWalletIcon = {
  view: (vnode) => {
    return m('svg.CustomWalletIcon', {
      'width': '32',
      'height': '31',
      'viewBox': '0 0 32 31',
      'fill': 'none',
      'xmlns': 'http://www.w3.org/2000/svg'
    },
    [
      m('path', {
        'd': `M3.89233 11.1048C3.89233 10.7044 4.13115 10.3426 4.49931 10.1852L23.5127 
          2.05858C24.1724 1.77658 24.9057 2.26061 24.9057 2.9781V18.9521C24.9057 
          19.3525 24.6669 19.7143 24.2987 19.8716L5.28536 27.9983C4.6256 28.2803 
          3.89233 27.7963 3.89233 27.0788V11.1048Z`,
        'stroke': '#666666',
        'stroke-width': '2'
      }),
      m('rect', {
        'x': '3.89258',
        'y': '10.7847',
        'width': '26.0869',
        'height': '18.3241',
        'rx': '1',
        'fill': 'white',
        'stroke': '#666666',
        'stroke-width': '2'
      })
    ]);
  }
};

export const CustomHamburgerIcon = {
  view: (vnode) => {
    return m('svg.CustomHamburgerIcon', {
      'width':'26',
      'height':'26',
      'viewBox':'0 0 26 26',
      'fill':'none',
      'xmlns':'http://www.w3.org/2000/svg'
    },
    [
      m('path', {
        'd':'M4.07959 10.5713H30.0796',
        'stroke':'black',
        'stroke-width':'2',
        'stroke-linecap':'round'
      }),
      m('path', {
        'd':'M4.07959 23.4287H30.0796',
        'stroke':'black',
        'stroke-width':'2',
        'stroke-linecap':'round'
      })
    ]);
  }
};
