function jsonFlickrApi(rsp) {
    window._flickrResponse = rsp;
}

tilt.attachEvent(document, "contentreceived", function() {
    var rsp = window._flickrResponse;
    if (rsp.stat == "ok") {
        var place = document.getElementById("place");
        var length = rsp.photos.photo.length;
        if (length > 6) length = 6;
        for(var i = 0; i < length; i++) {
            var photo = rsp.photos.photo[i];
            var a = place.appendChild(document.createElement("a"));
            a.href = "http://www.flickr.com/photos/" + photo.owner + "/" + photo.id + "/";
            var img = a.appendChild(document.createElement("img"));
            img.src = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_s.jpg";
            img.alt = photo.title;
        }
    }
    else {
        alert("error!");
    }
});
