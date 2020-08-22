var FS_ = null;
window.URL = window.URL || window.webkitURL;
window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL || window.resolveLocalFileSystemURI;
window.BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder || window.BlobBuilder;
window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

function errorCallback(e) {
  console.log('Error: ', e);
}

function deleteFile(filesystemPath) {
  console.log("delete",filesystemPath)
  window.resolveLocalFileSystemURL(filesystemPath, function(fileEntry) {
    fileEntry.remove(function() {
      readDirectories();
    }, errorCallback);
  }, errorCallback);
}

function readDirectories() {

  var dirReader = FS_.root.createReader();
  var fragment = document.createDocumentFragment();
  var filelist = document.getElementById('filelist');
  filelist.innerHTML = '';  
  var readEntries = function() {

    dirReader.readEntries(function(entries) {
      if (entries.length) {
        for (var i = 0, entry; entry = entries[i]; ++i) {
          if (entry.isFile) {
            var div = document.createElement('div');
            div.innerHTML =
                ['<a download="',entry.name,'"href="',entry.toURL ? entry.toURL() : entry.toURI(),
                 '" >',entry.name,'</a>',
                 '<button name="', entry.toURL ? entry.toURL() : entry.toURI(),
                 '" class="remove">delete</button>'].join('');
            fragment.appendChild(div);
          }
        }
        readEntries();
      } else {
        filelist.appendChild(fragment);
        
        window.deleteList = document.getElementsByClassName('remove');

        for(var i=0;i<deleteList.length;i++){
          // console.log('adding',i)
          deleteList[i].onclick=function(e){
            // console.log(e)
            deleteFile(e.target.name);
          }
        }
        if (!filelist.childElementCount) {
          filelist.textContent = "0 log in filesystem.";
        }
      }
    }, errorCallback);

  };

  readEntries();
}

document.getElementById('listlog').onclick = function() {
  console.log('click');
  readDirectories();
  
}


window.requestFileSystem(TEMPORARY, 1024 * 1024,  function(fs) {
  FS_ = fs;
  readDirectories();
}, errorCallback);