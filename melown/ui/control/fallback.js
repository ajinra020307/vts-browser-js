/**
 * @constructor
 */
Melown.UIControlMap = function(ui_) {
    this.ui_ = ui_;
    this.control_ = this.ui_.addControl("fallback",
      '<div id="melown-fallback"'
      + ' class="melown-fallback">'

        + '<div class="melown-fallback-text">'
            + '<p>Melown Maps is <a href="http://get.webgl.org/">WebGL</a> dependent service.</p>'
            + '<p>You can read more about Melown Maps in our <a/ href="https://www.melown.com/maps/about.html">About section</a>.</p>'
        + '</div>'

      + ' </div>');
};
