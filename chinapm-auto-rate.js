// ==UserScript==
// @name         现代卓越视频自动倍数捕获视频
// @namespace    https://github.com/mr-hanwy/Scripts
// @version      0.1.0
// @description  搭配《现代卓越学习视频下载》脚本，实现自动倍数捕获
// @author       Hanwy
// @match        https://service-cdn.qiqiuyun.net/*/media-player/*/player.html*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chinapm.org
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  // 显示播放器控制条。ps: 单纯为了方便观察播放进度而显示，无其他作用！
  let _controlBarInterval = setInterval(() => {
    let _controlBar = document.getElementsByClassName('vjs-control-bar')[0];
    if (_controlBar != null) {
      _controlBar.style.opacity = 1;
      clearInterval(_controlBarInterval);
    }
  }, 500);

  // 延迟模拟点击“倍速捕获”按钮
  setTimeout(() => {
    document.getElementById('media-source-extract').nextElementSibling.click();
  }, 3000);
})();