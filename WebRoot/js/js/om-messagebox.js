/*
 * $Id: om-messagebox.js,v 1.20 2012/03/01 06:11:41 wangfan Exp $
 * operamasks-ui omMessageBox 1.2
 *
 * Copyright 2011, AUTHORS.txt (http://ui.operamasks.org/about)
 * Dual licensed under the MIT or LGPL Version 2 licenses.
 * http://ui.operamasks.org/license
 *
 * http://ui.operamasks.org/docs/
 *
 * Depends:
 *  om-core.js
 *  om-mouse.js
 *  om-draggable.js
 *  om-position.js
 */
 
(function( $, undefined ) {
	 var tmpl = '<div class="om-messageBox om-widget om-widget-content om-corner-all" tabindex="-1">'+
	                '<div class="om-messageBox-titlebar om-widget-header om-helper-clearfix">'+
	                    '<span class="om-messageBox-title"></span>'+
	                    '<a href="#" class="om-messageBox-titlebar-close"><span class="om-icon om-icon-closethick"></span></a>' +
	                '</div>'+
	                '<div class="om-messageBox-content om-widget-content">'+
	                    '<table><tr vailgn="top">' +
	                        '<td class="om-messageBox-imageTd"><div class="om-messageBox-image"/>&nbsp;</td>' +
	                        '<td class="om-message-content-html"></td>' +
	                    '</tr></table>'+
	                '</div>'+
	                '<div class="om-messageBox-buttonpane om-widget-content om-helper-clearfix">'+
	                    '<div class="om-messageBox-buttonset"></div>'+
	                '</div>'+
	            '</div>';
	var _height = function(){
        // handle IE 6
        if ($.browser.msie && $.browser.version < 7) {
            var scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
                offsetHeight = Math.max(document.documentElement.offsetHeight, document.body.offsetHeight);
            return (scrollHeight < offsetHeight) ?  $(window).height() : scrollHeight;
        // handle "good" browsers
        } else {
            return $(document).height();
        }
	};
	var _width = function() {
        // handle IE
        if ( $.browser.msie ) {
            var scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
                offsetWidth = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);
            return (scrollWidth < offsetWidth) ? $(window).width() : scrollWidth;
        // handle "good" browsers
        } else {
            return $(document).width();
        }
    };
	var close = function(messageBox, mask, handler, value){
	    if (messageBox.hasClass('om-messageBox-waiting')) {
	        return;
	    }
	    handler ? handler(value) : jQuery.noop();
	    messageBox.remove();
	    mask.remove();
	};
    var _show = function(config){
        var onClose = config.onClose;
        var messageBox = $(tmpl).appendTo(document.body).css('z-index', 1500).position({
            of:window,
            collision: 'fit'
        }).omDraggable({
            containment: 'document',
            cursor:'move',
            handle: '.om-messageBox-titlebar'
        }).hide().keydown(function(event){
            if (event.keyCode && event.keyCode === $.om.keyCode.ESCAPE) {
                close(messageBox, mask, null, false);
                event.preventDefault();
            }
        });
        var mask = $('<div class="om-widget-overlay"/>').appendTo(document.body).show().css({height:_height(),width:_width()});
        var closeBut = messageBox.find('span.om-messageBox-title').html(config.title).next().hover(function(){
            $(this).addClass('om-state-hover');
        }, function(){
            $(this).removeClass('om-state-hover');
        }).focus(function(){
            $(this).addClass('om-state-focus');
        }).blur(function(){
            $(this).removeClass('om-state-focus');
        }).click(function(event){
            close(messageBox, mask, null, false);
            return false;
        }).bind('mousedown mouseup', function(){
            $(this).toggleClass('om-state-mousedown');
        });
        messageBox.find('div.om-messageBox-image').addClass('om-messageBox-image-' + config.type);
        var content = config.content;
        if (config.type == 'prompt') {
            content = content || '';
            content += '<br/><input id="om-messageBox-prompt-input" type="text"/>';
        }
        messageBox.find('td.om-message-content-html').html(content);
        var buttonSet = messageBox.find('div.om-messageBox-buttonset');
        switch (config.type) {
            case 'confirm':
                buttonSet.html('<button>ȷ��</button><button>ȡ��</button>').children().first().click(function(){
                    close(messageBox, mask, onClose, true);
                }).next().click(function(){
                    close(messageBox, mask, onClose, false);
                });
                break;
            case 'prompt':
                buttonSet.html('<button>ȷ��</button><button>ȡ��</button>').children().first().click(function(){
                    var returnValue = onClose ? onClose($('#om-messageBox-prompt-input').val()) : jQuery.noop();
                    if (returnValue !== false) {
                        messageBox.remove();
                        mask.remove();
                    }
                }).next().click(function(){
                    close(messageBox, mask, onClose, false);
                });
                break;
            case 'waiting':
                messageBox.addClass('om-messageBox-waiting');
                mask.addClass('om-messageBox-waiting');
                closeBut.hide(); //����ʾ�رհ�ť
                buttonSet.parent().hide(); //����ʾ����İ�ť���
                break;
            default:
                buttonSet.html('<button>ȷ��</button>').children().first().click(function(){
                    close(messageBox, mask, onClose, true);
                });
        }
        var buts = $('button',buttonSet);
        if($.fn.omButton){
            buts.omButton();
        }
        messageBox.show();
        var okBut = buts.first()[0];
        okBut ? okBut.focus() : messageBox.focus();
    };
     /**
      * @name omMessageBox
      * @class
      * omMessageBox�����ṩ��ʾ��Ϣ�ĵ������ڣ�������JavaScript��ʹ��alert()��confirm()��prompt()����ʱ���ֵ�������ʾ��Ϣ�ĵ������ڡ�<br/><br/>
      * <br/>
      * <h2>�������ص㣺</h2><br/>
      * <ul>
      *     <li>�нϺõ������������</li>
      *     <li>���Զ�����⡢���ݣ����ұ�������ݿ���ʹ��html����</li>
      *     <li>�������йرհ�ť��Ҳ���԰�Esc���ر�</li>
      *     <li>֧�ַḻ����ʾ��ͼ�겻ͬ��</li>
      *     <li>���Լ����ر��¼�</li>
      * </ul>
      * <br/>
      * <h2>�ṩ�����¹��߷�����</h2><br/>
      * <ul>
      *     <li>
      *         <b>$.omMessageBox.alert(config)</b><br/>
      *         ����һ��Alert��ʾ������һ����ȷ������ť������config�����������<br/>
      *         <ul style="margin-left:40px">
      *             <li>type��alert��ʾ�����ͣ����Ͳ�ͬʱ����������ߵ�ͼ��᲻ͬ��String���ͣ���ѡ��ֵ��'alert'��'success'��'error'��'question'��'warning'��Ĭ��ֵΪ'alert'��</li>
      *             <li>title���������ڵı������֣�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣Ĭ��ֵΪ'��ʾ'��</li>
      *             <li>content���������ڵ���ʾ���ݣ�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣��Ĭ��ֵ��</li>
      *             <li>onClose���������ڹر�ʱ�Ļص�������Function���ͣ����"ȷ��"��ť���رյ�������ʱ��Function�Ĳ���valueֵΪtrue����ESC���رյ�������ʱ��Function�Ĳ���valueֵΪfalse����Ĭ��ֵ��</li>
      *         </ul>
      *         <br/>ʹ�÷�ʽ���£�<br/>
      *         <pre>
      *             $.omMessageBox.alert({
      *                 type:'error',
      *                 title:'ʧ��',
      *                 content:'����ɾ��&lt;font color="red">admin&lt;/font>�û�',
      *                 onClose:function(value){
      *                     alert('do something');
      *                 }
      *             });
      *         </pre>
      *     </li>
      *     <li>
      *         <b>$.omMessageBox.confirm(config)</b><br/>
      *         ����һ��Confirm��ʾ���С�ȷ�����͡�ȡ������ť������config�����������<br/>
      *         <ul style="margin-left:40px">
      *             <li>title���������ڵı������֣�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣Ĭ��ֵΪ'ȷ��'��</li>
      *             <li>content���������ڵ���ʾ���ݣ�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣��Ĭ��ֵ��</li>
      *             <li>onClose���������ڹر�ʱ�Ļص�������Function���ͣ����"ȷ��"��ť���رյ�������ʱ��Function�Ĳ���valueֵΪtrue�������ȡ������ť��ESC���رյ�������ʱ��Function�Ĳ���valueֵΪfalse����Ĭ��ֵ��</li>
      *         </ul>
      *         <br/>ʹ�÷�ʽ���£�<br/>
      *         <pre>
      *             $.omMessageBox.confirm({
      *                 title:'ȷ��ɾ��',
      *                 content:'ɾ���û��������еķ����ͻ�����ͬʱɾ�������ɻָ�������ȷ��Ҫ��������',
      *                 onClose:function(value){
      *                     alert(value?'��ʼɾ������':'��ɾ����');
      *                 }
      *             });
      *         </pre>
      *     </li>
      *     <li>
      *         <b>$.omMessageBox.prompt(config)</b><br/>
      *         ����һ��Prompt��ʾ����һ�������͡�ȷ�����͡�ȡ������ť������config�����������
      *         <ul style="margin-left:40px">
      *             <li>title���������ڵı������֣�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣Ĭ��ֵΪ'������'��</li>
      *             <li>content���������ڵ���ʾ���ݣ�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣��Ĭ��ֵ��</li>
      *             <li>onClose���������ڹر�ʱ�Ļص�������Function���ͣ����"ȷ��"��ť���رյ�������ʱ��Function�Ĳ���valueֵΪ�û����������������ַ�����һ�����ַ������������ȡ������ť��ESC���رյ�������ʱ��Function�Ĳ���valueֵΪfalse����Ĭ��ֵ��<b>ע�⣺�ڴ˷����з���false������ֹ�������ڹرա�</b></li>
      *         </ul>
      *         <br/>ʹ�÷�ʽ���£�<br/>
      *         <pre>
      *             $.omMessageBox.prompt({
      *                 title:'��Ʒ����',
      *                 content:'��������Ҫ�������Ʒ�����������������ֻ�ܹ���12ǧ�ˣ���',
      *                 onClose:function(value){
      *                     if(value===false){ //����ȡ����ESC
      *                         alert('ȡ������');
      *                         return;
      *                     }
      *                     if(value==''){
      *                         alert('��������Ϊ��');
      *                         return false; //���رյ�������
      *                     }
      *                     if(value-0+'' !== value){
      *                         alert('ֻ����������');
      *                         return false;  //���رյ�������
      *     `               }
      *                     if(value&lt;0 || value&gt;12){
      *                         alert('������0-12֮������֣��ɴ�С����');
      *                         return false; //���رյ�������
      *                     }else{
      *                         alert('��ʼ����'+value+'ǧ����Ʒ');
      *                     }
      *                 }
      *             });
      *         </pre>
      *     </li>
      *     <li>
      *         <b>$.omMessageBox.waiting(config | 'close')</b><br/>
      *         ����һ��Prompt��ʾ����һ�������͡�ȷ�����͡�ȡ������ť������ʾ����û�йرհ�ť��Ҳ�����԰�ESC�رա����������'close'ʱ��ʾ�ر��ϴε�����Waiting��ʾ���ڡ������configʱ��ʾҪ����һ��Waiting��ʾ���ڣ�����config�����������
      *         <ul style="margin-left:40px">
      *             <li>title���������ڵı������֣�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣Ĭ��ֵΪ'���Ժ�'��</li>
      *             <li>content���������ڵ���ʾ���ݣ�String���ͣ�����ʹ����ͨ�ַ�����Ҳ����ʹ��html���롣��Ĭ��ֵ��</li>
      *         </ul>
      *         <br/>ʹ�÷�ʽ���£�<br/>
      *         <pre>
      *             //������ʾ
      *             $.omMessageBox.waiting({
      *                 title:'���Ժ�',
      *                 content:'���������ڴ��������������Ժ�...',
      *             });
      * 
      *             //�ر���ʾ
      *             $.omMessageBox.waiting('close');
      *         </pre>
      *     </li>
      * </ul>
      */
    $.omMessageBox = {
        alert: function(config){
            config = config || {};
            config.title = config.title || '��ʾ';
            config.type = config.type || 'alert';
            _show(config);
        },
        confirm: function(config){
            config = config || {};
            config.title = config.title || 'ȷ��';
            config.type = 'confirm';
            _show(config);
        },
        prompt: function(config){
            config = config || {};
            config.title = config.title || '������';
            config.type = 'prompt';
            _show(config);
        },
        waiting: function(config){
            if (config === 'close') {
                $('.om-messageBox-waiting').remove();
                return;
            }
            config = config || {};
            config.title = config.title || '��ȴ�';
            config.type = 'waiting';
            _show(config);
        }
    };
}(jQuery));