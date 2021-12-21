//META{"name":"ResizeX"}*//
var resizexDragging;
var resizexHandle;
var resizexImage;
var resizexWidth;
var resizexX;
var resizexY;
var resizexAspectRatio;

var ResizeX = function() {};

// unused
ResizeX.prototype.load = function() {};
ResizeX.prototype.unload = function() {};
ResizeX.prototype.onMessage = function() {};
// unused

ResizeX.prototype.start = function() {
    BdApi.injectCSS("resizex-style", '@font-face{font-family:Batch;src:url(https://cdn.rawgit.com/AdamWhitcroft/batch/a3640352/Webfont/batch-icons-webfont.ttf)}.resizex-icon::before{content:"\\F0A5";transform:scaleX(-1);display:inline-block;margin-top:8px;draggable:false!important}.resizex-handle{box-sizing:border-box;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:reverse;flex-direction:row-reverse;-webkit-box-pack:justify;justify-content:space-between;-webkit-box-align:center;align-items:center;cursor:nwse-resize;draggable:false!important;font-family:Batch;min-width:none!important}iframe.image{min-width:400px;max-width:none!important}.modal{overflow:auto;}');
    $(document)
        .on("mousemove.resizex", function(e) {
            if (resizexHandle) {
                $(resizexHandle).siblings().width(resizexWidth + (e.pageX - resizexX + e.pageY - resizexY) / 2);
                $(resizexHandle).siblings().height($(resizexHandle).siblings().width() * resizexAspectRatio);
            }
            if (resizexImage) {
                resizexDragging = true;
                $(resizexImage).width(resizexWidth + (e.pageX - resizexX + e.pageY - resizexY) / 2);
            }
        })
        .on("mouseup.resizex", function() {
            resizexHandle = null;
            resizexImage = null;
            BdApi.clearCSS("resizex-dragging");
        });
};

ResizeX.prototype.stop = function() {
    BdApi.clearCSS("resizex-style");
    $(document).add("*").off(".resizex");
};

ResizeX.prototype.observer = function(e) {
    if (e.addedNodes.length && e.addedNodes[0].classList && e.addedNodes[0].classList.contains("embed-thumbnail-video")) {
        $("<div class='resizex-handle'><div class='resizex-icon'/></div>")
            .insertAfter($(e.addedNodes[0]).find("iframe"))
            .on("mousedown.resizex", function(e) {
                resizexWidth = $(this).siblings().width();
                resizexX = e.pageX;
                resizexY = e.pageY;
                resizexHandle = this;
                resizexAspectRatio = $(this).siblings().height() / $(this).siblings().width();
                BdApi.injectCSS("resizex-dragging", "iframe{pointer-events:none;}*{-webkit-user-select:none!important;cursor:nwse-resize!important;}");
            });
    }
    if (e.addedNodes.length && $(e.addedNodes[0]).attr("src") && $(e.addedNodes[0]).attr("src").indexOf("discordapp") != -1 && ($(e.addedNodes[0]).parent().attr('class')?$(e.addedNodes[0]).parent().attr('class').indexOf("embed-thumbnail-video") == -1:true)) {
        $(e.addedNodes[0])
            .one("mousedown.resizex", function() {
                resizexWidth = $(this).width();
                $(this)
                    .attr("src", $(this).attr("src").split("?")[0])
                    .attr("height", "")
                    .attr("width", "")
                    .attr("draggable", "false")
                    .width(resizexWidth)
                    .css("min-width", resizexWidth)
                    .css("max-width", "none")
                    .parent().attr("draggable", "false");
            })
            .on("mousedown.resizex", function(e) {
                resizexImage = this;
                resizexWidth = $(this).width();
                resizexX = e.pageX;
                resizexY = e.pageY;
                resizexDragging = false;
            })
            .parent()
            .on("click.resizex", function() {
                if (resizexDragging)
                    return false;
            });
    }
};

ResizeX.prototype.getSettingsPanel = function() {
    return "";
};

ResizeX.prototype.getName = function() {
    return "ResizeX";
};

ResizeX.prototype.getDescription = function() {
    return "Lets you resize videos and images";
};

ResizeX.prototype.getVersion = function() {
    return "0.1.2";
};

ResizeX.prototype.getAuthor = function() {
    return "Anxeal";
};
