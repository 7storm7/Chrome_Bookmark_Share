BMShare

Extension for sharing the selected subtree of the bookmark tree

This project contains a browser action (icon + extension window + dialog for bookmark add/edit/share/import).

When user click on the browser extension icon;

* A window is opened with existing bookmark tree,
* Right side of each line;
  > If the line contains a folder, "Add, Import, Share" links exist,
  > If the line contains a bookmark, "Edit, Delete" links exist.
     
* If the user clicks on "Share" link;
  > A dialog opens with a text area in which the selected subtree content exists,
  > When the user clicks on the content, the whole content is selected, and becomes ready to copy manually,
  > When the user copies the content, he/she could send the text to the destination with any tool he/she selects (email, whatsapp, ...),
* When the target user copies the received content, to import the bookmark subtree, he/she;
  > Opens the extension window by clicking on the extension icon,
  > Select a folder to append the received subtree and clicks on "Import" link at the right side of the selected folder,
  > Paste the copied content into the textarea of the opened dialog,
  > Click Import button to finish import process,
  > The folder could instantly be observed in the bookmark tree in the extension window. 
  
  
  Issues:
  
  >Currently the imported subtree is not observed as a whole instantly. Only the top folder imported (created) is shown,


To load the extension into Google Chrome:
Follow the steps in :

https://developer.chrome.com/extensions/getstarted

For more info about extension development: 

https://developer.chrome.com/extensions/overview
