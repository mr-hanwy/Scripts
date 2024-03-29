// ==UserScript==
// @name         现代卓越学习视频下载
// @namespace    https://github.com/mr-hanwy/Scripts
// @version      1.0.0
// @description  自动下载《现代卓越》的学习视频！
// @author       Hanwy
// @match		     https://service-cdn.qiqiuyun.net/*/media-player/*/player.html*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';
  (function () {
    if (document.getElementById('media-source-extract')) {
      return;
    }

    // 复写 call 函数，绕过劫持检查
    Function.prototype.toString.call = function (caller) {
      return `'function ${caller.name}() { [native code] }'`;
    }

    // 轮询监听 iframe 的加载
    setInterval(() => {
      try {
        Array.prototype.forEach.call(document.getElementsByTagName('iframe'), (iframe) => {
          // 若 iframe 使用了 sandbox 进行操作约束，删除原有 iframe，拷贝其备份，删除 sandbox 属性，重新载入
          // 若 iframe 已载入，再修改 sandbox 属性，将修改无效。故通过新建 iframe 的方式绕过
          if (iframe.hasAttribute('sandbox')) {
            const parentNode = iframe.parentNode;
            const tempIframe = iframe.cloneNode();
            tempIframe.removeAttribute("sandbox");
            iframe.remove();
            parentNode.appendChild(tempIframe);
          }
        });
      } catch (error) {
        console.log(error);
      }
    }, 1000);

    const date = new Date();
    let sumFragment = 0; // 已经捕获的所有片段数
    let isClose = false; // 是否关闭
    let isStreamDownload = false; // 是否使用流式下载
    let _sourceBufferList = []; // 媒体轨道
    const $showBtn = document.createElement('div'); // 展示按钮
    const $btnDownload = document.createElement('div'); // 下载按钮
    const $btnStreamDownload = document.createElement('div'); // 流式下载按钮
    const $downloadNum = document.createElement('div'); // 已捕获视频片段数
    const $tenRate = document.createElement('div'); // 倍速捕获
    const $closeBtn = document.createElement('div'); // 关闭
    const $container = document.createElement('div'); // 容器
    $closeBtn.innerHTML = `<img style="padding-top: 4px; width: 24px; display: inline-block; cursor: pointer;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAk1BMVEUAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////ROyVeAAAAMHRSTlMA1Sq7gPribxkJx6Ey8onMsq+GTe10QF8kqJl5WEcvIBDc0sHAkkk1FgO2ZZ+dj1FHfPqwAAACNElEQVRIx6VW6ZqqMAwtFlEW2Rm3EXEfdZa+/9PdBEvbIVXu9835oW1yjiQlTWQE/iYPuTObOTzMNz4bQFRlY2FgnFXRC/o01mytiafP+BPvQZk56bcLSOXem1jpCy4QgXvRtlEVCARfUP65RM/hp29/+0R7eSbhoHlnffZ8h76e6x1tyw9mxXaJ3nfTVLd89hQr9NfGceJxfLIXmONh6eNNYftNSESRmgkHlEOjmhgBbYcEW08FFQN/ro6dvAczjhgXEdQP76xHEYxM+igQq259gLrCSlwbD3iDtTMy+A4Yuk0B6zV8c+BcO2OgFIp/UvJdG4o/Rp1JQYXeZFflPEFMfvugiFGFXN587YtgX7C8lRGFXPCGGYCCzlkoxJ4xqmi/jrIcdYYh5pwxiwI/gt7lDDFrcLiMKhBJ//W78ENsJgVUsV8wKpjZBXshM6cCW0jbRAilICFxIpgGMmmiWGHSIR6ViY+DPFaqSJCbQ5mbxoZLIlU0Al/cBj6N1uXfFI0okLppi69StmumSFQRP6oIKDedFi3vRDn3j6KozCZlu0DdJb3AupJXNLmqkk9+X9FEHLt1Jq8oi1H5n01AtRlvwQZQl9hmtPY4JEjMDs5ftWJN4Xr4lLrV2OHiUDHCPgvA/Tn/hP4zGUBfjZ3eLJ+NIOfHxi8CMoAQtYfmw93v01O0e7VlqqcCsXML3Vsu94cxnb4c7ML5chG8JIP9b38dENGaj3+x+TpiA/AL/fen8In7H8l3ZjdJQt2TAAAAAElFTkSuQmCC">`;
    $showBtn.innerHTML = `<img style="padding-top: 4px; width: 24px; display: inline-block; cursor: pointer;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADIBAMAAABfdrOtAAAAElBMVEUAAAD///////////////////8+Uq06AAAABXRSTlMA2kCAv5tF5NoAAAErSURBVHja7dzNasJAFIbhz8Tu7R0Eq/vQNHuxzL6YnPu/ldYpAUckxJ8zSnjfdTIPzHrOUawJdqmDJre1S/X7avigbM08kMgMSmt+iPWKbcwTsb3+KswXseOFLb2RnaTgjXTxtpwRq7XMgWz9kZ8cSKcwE6SX+SMGAgICAvJCyHdz2ud0pEx+/BpFaj2kEgQEBAQEBAQEBOT1kXWSkhbvk1vptOLs1LEWNrmVRgIBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBeTayTqpufogxduqM3q2AgICAgICAgICA3IOko4ZXkB/pqOHzhyZBQEBAQLIieVahtDNBDnrLgZT+yC4HUkmtN9JnWUiVZbVWliVhseCJdPqvCH5IV2tQNl4r6Bod+wWq9eeDik+xFQAAAABJRU5ErkJggg==">`;

    // 倍速捕获
    function _tenRatePlay() {
      let playbackRate = 16;
      if ($tenRate.innerHTML === '倍速捕获') {
        $tenRate.innerHTML = '恢复正常播放';
      } else {
        playbackRate = 1;
        $tenRate.innerHTML = '倍速捕获';
      }

      let $domList = document.getElementsByTagName('video');
      for (let i = 0, length = $domList.length; i < length; i++) {
        const $dom = $domList[i];
        // 设置速率
        $dom.playbackRate = playbackRate;
        $dom.currentTime = 0;
        $dom.muted = true;
      }
    }

    // 流式下载
    function _streamDownload() {
      var _hmt = _hmt || [];
      (function () {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?1f12b0865d866ae1b93514870d93ce89";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
      })();

      // 对应状态未下载结束的媒体轨道
      const remainSourceBufferList = []
      _sourceBufferList.forEach((target) => {
        // 对应的 MSE 状态为已下载完成状态
        if (target.MSEInstance.readyState === 'ended') {
          target.streamWriter.close();
        } else {
          remainSourceBufferList.push(target);
        }
      });

      // 流式下载，释放已下载完成的媒体轨道，回收内存
      _sourceBufferList = remainSourceBufferList;
    }

    // 普通下载
    function _download() {
      var _hmt = _hmt || [];
      (function () {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?1f12b0865d866ae1b93514870d93ce89";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
      })();

      _sourceBufferList.forEach((target) => {
        const mime = target.mime.split(';')[0];
        const type = mime.split('/');
        const fileBlob = new Blob(target.bufferList, { type: mime }); // 创建一个Blob对象，并设置文件的 MIME 类型
        const a = document.createElement('a');
        a.download = getFileName({ date, type });
        a.href = URL.createObjectURL(fileBlob);
        a.style.display = 'none';
        document.body.appendChild(a);
        // 禁止 click 事件冒泡，避免全局拦截
        a.onclick = function (e) {
          e.stopPropagation();
        }

        a.click();
        a.remove();
      });
    }

    // 监听资源全部录取成功
    let _endOfStream = window.MediaSource.prototype.endOfStream;
    window.MediaSource.prototype.endOfStream = function endOfStream() {
      if (isStreamDownload) {
        alert('资源全部捕获成功，即将下载！');
        setTimeout(_streamDownload); // 等待 MediaSource 状态变更
        _endOfStream.call(this);
        return;
      }

      _download();

      _endOfStream.call(this);
    }

    // 录取资源
    let _addSourceBuffer = window.MediaSource.prototype.addSourceBuffer;
    window.MediaSource.prototype.addSourceBuffer = function addSourceBuffer(mime) {
      _appendDom();

      let sourceBuffer = _addSourceBuffer.call(this, mime);
      let _append = sourceBuffer.appendBuffer;
      let bufferList = [];
      const _sourceBuffer = {
        mime,
        bufferList,
        MSEInstance: this
      }

      // 如果 streamSaver 已提前加载完成，则初始化对应的 streamWriter
      try {
        if (window.streamSaver) {
          const type = mime.split(';')[0].split('/');
          _sourceBuffer.streamWriter = streamSaver.createWriteStream(getFileName({ date, type })).getWriter();
        }
      } catch (error) {
        console.error(error);
      }

      _sourceBufferList.push(_sourceBuffer);
      sourceBuffer.appendBuffer = function (buffer) {
        sumFragment++;
        $downloadNum.innerHTML = `已捕获 ${sumFragment} 个片段`;

        if (isStreamDownload && _sourceBuffer.streamWriter) { // 流式下载
          _sourceBuffer.streamWriter.write(new Uint8Array(buffer));
        } else { // 普通 blob 下载
          bufferList.push(buffer);
        }

        _append.call(this, buffer);
      }

      return sourceBuffer;
    }

    window.MediaSource.prototype.addSourceBuffer.toString = function toString() {
      return 'function addSourceBuffer() { [native code] }';
    }

    // 添加操作的 dom
    function _appendDom() {
      if (document.getElementById('media-source-extract')) {
        return;
      }

      $container.style = `position: fixed; top: 50px; right: 50px; text-align: right; z-index: 9999;`;
      const baseStyle = `float:right; clear:both; margin-top: 10px; padding: 0 20px; color: white; cursor: pointer; font-size: 16px; font-weight: bold; line-height: 40px; text-align: center; border-radius: 4px; background-color: #3498db; box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.3);`;
      $tenRate.innerHTML = '倍速捕获';
      $downloadNum.innerHTML = '已捕获 0 个片段';
      $btnStreamDownload.innerHTML = '特大视频下载，边下载边保存';
      $btnDownload.innerHTML = '下载已捕获片段';
      $btnDownload.id = 'media-source-extract';
      $tenRate.style = baseStyle;
      $downloadNum.style = baseStyle;
      $btnDownload.style = baseStyle;
      $btnStreamDownload.style = baseStyle;
      $btnStreamDownload.style.display = 'none';
      $showBtn.style = `float:right; clear:both; display: none; margin-top: 4px; height: 34px; width: 34px; line-height: 34px; text-align: center; border-radius: 4px; background-color: rgba(0, 0, 0, 0.5);`;
      $closeBtn.style = `float:right; clear:both; margin-top: 10px; height: 34px; width: 34px; line-height: 34px; text-align: center; display: inline-block; border-radius: 50%; background-color: rgba(0, 0, 0, 0.5);`;

      $btnDownload.addEventListener('click', _download);
      $tenRate.addEventListener('click', _tenRatePlay);

      // 关闭控制面板
      $closeBtn.addEventListener('click', function () {
        $downloadNum.style.display = 'none';
        $btnStreamDownload.style.display = 'none';
        $btnDownload.style.display = 'none';
        $closeBtn.style.display = 'none';
        $tenRate.style.display = 'none';
        $showBtn.style.display = 'inline-block';
        isClose = true;
      });

      // 显示控制面板
      $showBtn.addEventListener('click', function () {
        if (!isStreamDownload) {
          $btnDownload.style.display = 'inline-block';
          $btnStreamDownload.style.display = 'inline-block';
        }

        $downloadNum.style.display = 'inline-block';
        $closeBtn.style.display = 'inline-block';
        $tenRate.style.display = 'inline-block';
        $showBtn.style.display = 'none';
        isClose = false;
      });

      // 启动流式下载
      $btnStreamDownload.addEventListener('click', function () {
        (function () {
          var hm = document.createElement("script");
          hm.src = "https://hm.baidu.com/hm.js?1f12b0865d866ae1b93514870d93ce89";
          var s = document.getElementsByTagName("script")[0];
          s.parentNode.insertBefore(hm, s);
        })();

        isStreamDownload = true;
        $btnDownload.style.display = 'none';
        $btnStreamDownload.style.display = 'none';
        _sourceBufferList.forEach(sourceBuffer => {
          if (!sourceBuffer.streamWriter) {
            const type = sourceBuffer.mime.split(';')[0].split('/');
            sourceBuffer.streamWriter = streamSaver.createWriteStream(getFileName({ date, type })).getWriter();
            sourceBuffer.bufferList.forEach(buffer => {
              sourceBuffer.streamWriter.write(new Uint8Array(buffer));
            });

            sourceBuffer.bufferList = [];
          }
        });
      });

      document.getElementsByTagName('html')[0].insertBefore($container, document.getElementsByTagName('head')[0]);
      $container.appendChild($btnStreamDownload);
      $container.appendChild($downloadNum);
      $container.appendChild($btnDownload);
      $container.appendChild($tenRate);
      $container.appendChild($closeBtn);
      $container.appendChild($showBtn);

      // 加载 stream 流式下载器
      try {
        let $streamSaver = document.createElement('script');
        $streamSaver.src = 'https://upyun.luckly-mjw.cn/lib/stream-saver.js'
        document.body.appendChild($streamSaver);
        $streamSaver.addEventListener('load', () => {
          $btnStreamDownload.style.display = 'inline-block';
        });

      } catch (error) {
        console.error(error);
      }
    }

    function getFileName({ date, type }) {
      return `${date.toLocaleString().replaceAll(/(\/|\:|\s)/ig, '')}.${type[0]}.${type[1]}`;
    }
  })();
})();