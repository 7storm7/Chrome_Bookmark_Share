// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// Search the bookmarks when entering the search keyword.
$(function() {
    $('#search').change(function() {
        $('#bookmarks').empty();
        dumpBookmarks($('#search').val());
    });
});
// Traverse the bookmark tree, and print the folder and nodes.
function dumpBookmarks(query) {
    var bookmarkTreeNodes = chrome.bookmarks.getTree(
        function(bookmarkTreeNodes) {
            $('#bookmarks').empty().append(dumpTreeNodes(bookmarkTreeNodes, query));
        });
}
function dumpTreeNodes(bookmarkNodes, query) {
    var list = $('<ul>');
    var i;
    for (i = 0; i < bookmarkNodes.length; i++) {
        list.append(dumpNode(bookmarkNodes[i], query));
    }
    return list;
}
function dumpNode(bookmarkNode, query) {
    if (bookmarkNode.title) {
        if (query && !bookmarkNode.children) {
            if (String(bookmarkNode.title).indexOf(query) == -1) {
                return $('<span></span>');
            }
        }
        var anchor = $('<a>');
        anchor.attr('href', bookmarkNode.url);
        anchor.text(bookmarkNode.title);
        /*
         * When clicking on a bookmark in the extension, a new tab is fired with
         * the bookmark url.
         */
        anchor.click(function() {
            chrome.tabs.create({url: bookmarkNode.url});
        });
        var span = bookmarkNode.children ? $('<span style="font-weight: bold;">') : $('<span >');
        var options = bookmarkNode.children ?
            $('<span>[<a href="#" id="addlink">Add</a>, <a href="#" id="importlink">Import</a>, <a href="#" id="sharelink">Share</a>]</span>') :
            $('<span>[<a id="editlink" href="#">Edit</a> <a id="deletelink" ' +
                'href="#">Delete</a>]</span>');
        var edit = bookmarkNode.children ? $('<table><tr><td>Name</td><td>' +
            '<input id="title"></td></tr><tr><td>URL</td><td><input id="url">' +
            '</td></tr></table>') : $('<input>');

        var shared = $('<textarea id="shared" rows="3" cols="35" style="font-size: xx-small">Selected bookmark tree</textarea>');

        var imported = $('<table><tr><td>Content</td><td>' +
            '<textarea id="importContent" rows="3" cols="35" style="font-size: xx-small"></textarea></td></tr></table>');

        // Show add and edit links when hover over.
        span.hover(function() {
                span.append(options);
                $('#deletelink').click(function() {
                    $('#deletedialog').empty().dialog({
                        autoOpen: false,
                        title: 'Confirm Deletion',
                        resizable: false,
                        height: 140,
                        modal: true,
                        overlay: {
                            backgroundColor: '#000',
                            opacity: 0.5
                        },
                        buttons: {
                            'Yes, Delete It!': function() {
                                chrome.bookmarks.remove(String(bookmarkNode.id));
                                span.parent().remove();
                                $(this).dialog('destroy');
                            },
                            Cancel: function() {
                                $(this).dialog('destroy');
                            }
                        }
                    }).dialog('open');
                });
                $('#addlink').click(function() {
                    $('#adddialog').empty().append(edit).dialog({autoOpen: false,
                        closeOnEscape: true, title: 'Add New Bookmark', modal: true,
                        buttons: {
                            'Add' : function() {
                                chrome.bookmarks.create({parentId: bookmarkNode.id,
                                    title: $('#title').val(), url: $('#url').val()});
                                $('#bookmarks').empty();
                                $(this).dialog('destroy');
                                window.dumpBookmarks();
                            },
                            'Cancel': function() {
                                $(this).dialog('destroy');
                            }
                        }}).dialog('open');
                });
                $('#sharelink').click(function() {
                    var bookmarkSubTree = chrome.bookmarks.getSubTree(bookmarkNode.id,  function(bookmarkSubTree) {
                        console.log(bookmarkSubTree);
                        console.log(bookmarkNode);

                        var sharedFolder = new Object();
                        sharedFolder.folder = bookmarkNode.title;
                        sharedFolder.bookmarks = JSON.stringify(bookmarkSubTree);

                        shared.val(JSON.stringify(sharedFolder));

                        shared.on("click", function () {
                            console.log("+#shared>>click");


                            shared.select();
                        });

                        $('#sharedialog').empty().append(shared).dialog({autoOpen: false,
                            closeOnEscape: true, title: 'Share Bookmarks', modal: true,
                            buttons: {
                                'Close' : function() {
                                    $(this).dialog('destroy');
                                    //window.dumpBookmarks();
                                }
                            }}).dialog('open');
                    });
                });
                $('#editlink').click(function() {
                    edit.val(anchor.text());
                    $('#editdialog').empty().append(edit).dialog({autoOpen: false,
                        closeOnEscape: true, title: 'Edit Title', modal: true,
                        show: 'slide', buttons: {
                            'Save': function() {
                                chrome.bookmarks.update(String(bookmarkNode.id), {
                                    title: edit.val()
                                });
                                anchor.text(edit.val());
                                options.show();
                                $(this).dialog('destroy');
                            },
                            'Cancel': function() {
                                $(this).dialog('destroy');
                            }
                        }}).dialog('open');
                });
                $('#importlink').click(function() {
                    //edit.val(anchor.text());
                    $('#importdialog').empty().append(imported).dialog({autoOpen: false,
                        closeOnEscape: true, title: 'Import Bookmark Folder', modal: true,
                        show: 'slide', buttons: {
                            'Import': function() {
                                var importedObject = jQuery.parseJSON($('#importContent').val());
                                //var folderName = importedObject.folder;
                                var importedContent = jQuery.parseJSON(importedObject.bookmarks);

                                console.log(importedContent);


                                function importAll(obj, pId) {
                                    console.log("+importAll>>");

                                    if (Array.isArray(obj))
                                    {
                                        console.log("   isArray...: " + obj.length);

                                        $.each(obj, function(key, val) { importAll(val, pId) });
                                    }
                                    else if(obj.hasOwnProperty("children")){
                                        // do the rest
                                        chrome.bookmarks.create({'parentId': pId,
                                                'title': obj.title},
                                            function(newFolder) {
                                                console.log("   added folder: " + newFolder.title);
                                                importAll(obj.children, newFolder.id);
                                            });
                                    }
                                    else
                                    {
                                        chrome.bookmarks.create({parentId: pId, title: obj.title, url: obj.url});
                                        console.log("   >>>added bookmark: title[" + obj.title + "]");
                                    }
                                }

                                importAll(importedContent, bookmarkNode.id);

                                $(this).dialog('destroy');
                                dumpBookmarks();
                            },
                            'Cancel': function() {
                                $(this).dialog('destroy');
                            }
                        }}).dialog('open');
                });

                options.fadeIn();
            },
            // unhover
            function() {
                options.remove();
            }).append(anchor);
    }
    var li = $(bookmarkNode.title ? '<li>' : '<div>').append(span);
    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
        li.append(dumpTreeNodes(bookmarkNode.children, query));
    }
    return li;
}
document.addEventListener('DOMContentLoaded', function () {
    dumpBookmarks();
});