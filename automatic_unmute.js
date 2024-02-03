// ==UserScript==
// @name         《现代卓越》学习视频自动从头开始播放
// @namespace    https://github.com/mr-hanwy/Scripts
// @version      0.1.0
// @description  播放视频时，可以自动从头开始播放，无需再手动点击按钮或将进度条拖动最开始。
// @author       Hanwy
// @match        https://remote.chinapm.org/course/*/task/*/*show
// @match        https://service-cdn.qiqiuyun.net/*media-player/*/player.html?lisence=*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

// 获取当前作用域的地址
let webUrl = window.location.href;
// 判断是否为播放器所在作用域
if (webUrl.indexOf('service-cdn.qiqiuyun.net') !== -1) {
  (function () {
    'use strict';

    let interval = window.setInterval(() => {
      if (document.readyState === 'complete') {
        console.log('页面渲染完成！');
        window.clearInterval(interval);

        let _v = document.getElementsByTagName('video')[0];
        _v.muted = false;

        // 从头播放
        document.querySelector('div.qqy_ui_tip.remember-pos-tip span.qqy_ui_tip-click_content').click();
        document.querySelector('button.vjs-play-control.vjs-control.vjs-button.vjs-paused').click();
      }
    }, 2000);
  })();
}