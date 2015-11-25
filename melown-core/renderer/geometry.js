
Melown.RendererGeometry = {};

Melown.RendererGeometry.setFaceVertices = function(vertices_, a, b, c, index_) {
    vertices_[index_] = a[0];
    vertices_[index_+1] = a[1];
    vertices_[index_+2] = a[2];

    vertices_[index_+3] = b[0];
    vertices_[index_+4] = b[1];
    vertices_[index_+5] = b[2];

    vertices_[index_+6] = c[0];
    vertices_[index_+7] = c[1];
    vertices_[index_+8] = c[2];
};


Melown.RendererGeometry.setFaceUVs = function(uvs_, a, b, c, index_) {
    uvs_[index_] = a[0];
    uvs_[index_+1] = a[1];

    uvs_[index_+2] = b[0];
    uvs_[index_+3] = b[1];

    uvs_[index_+4] = c[0];
    uvs_[index_+5] = c[1];
};


//! Procedural mesh representing a heightmap block
//! Creates a grid of size x size vertices, all coords are [0..1].
Melown.RendererGeometry.buildHeightmap = function(size_) {
    size_--;

    var g = Melown.RendererGeometry;
    var numFaces_ = (size_* size_) * 2;
    var vertices_ = new Float32Array(numFaces_ * 3 * 3);//[];
    var uvs_ = new Float32Array(numFaces_ * 3 * 2);//[];

    var USHRT_MAX = 65535;
    var factor_ = 1.0 * size_;
    var index_ = 0;
    var index2_ = 0;

    for (var i = 0; i < size_; i++)
    {
        for (var j = 0; j < size_; j++)
        {
            var x1 = (j) * factor_;
            var x2 = (j+1) * factor_;

            var y1 = (i) * factor_;
            var y2 = (i+1) * factor_;

            g.setFaceVertices(vertices_, [x1, y1, 0], [x2, y1, 0], [x2, y2, 0], index_);
            g.setFaceUVs(vertices_, [x1, y1], [x2, y1], [x2, y2], index2_);
            index_ += 9;
            index2_ += 6;

            g.setFaceVertices(vertices_, [x2, y2, 0], [x1, y2, 0], [x1, y1, 0], index_);
            g.setFaceUVs(vertices_, [x2, y2], [x1, y2], [x1, y1], index2_);
            index_ += 9;
            index2_ += 6;
        }
    }

    var bbox_ = new Melown.BBox(0,0,0,1,1,1);

    return { bbox_:bbox_, vertices_:vertices_, uvs_: uvs_};
};


Melown.RendererGeometry.spherePos = function(lon_, lat_) {
    lat_ *= Math.PI;
    lon_ *= 2*Math.PI;

    return [Math.cos(lon_)*Math.sin(lat_)*0.5 + 0.5,
                Math.sin(lon_)*Math.sin(lat_)*0.5 + 0.5,
                Math.cos(lat_) * 0.5 + 0.5];
};


//! Creates an approximation of a unit sphere, note that all coords are
//! in the range [0..1] and the center is in (0.5, 0.5). Triangle "normals"
//! are oriented inwards.
Melown.RendererGeometry.buildSkydome = function(latitudeBands_, longitudeBands_) {
    var g = Melown.RendererGeometry;
    var numFaces_ = (latitudeBands_ * longitudeBands_) * 2;
    var vertices_ = new Float32Array(numFaces_ * 3 * 3);
    var uvs_ = new Float32Array(numFaces_ * 3 * 2);
    var index_ = 0;
    var index2_ = 0;

    for (var lat_ = 0; lat_ < latitudeBands_; lat_++) {
        for (var lon_ = 0; lon_ < longitudeBands_; lon_++)
        {
            var lon1_ = ((lon_) / longitudeBands_);
            var lon2_ = ((lon_+1) / longitudeBands_);

            var lat1_ = ((lat_) / latitudeBands_);
            var lat2_ = ((lat_+1) / latitudeBands_);

            g.makeQuad(lon1_, lat1_, lon2_, lat2_, vertices_, index_, uvs_, index2_);
            index_ += 9*2;
            index2_ += 6*2;
        }
    }

    var bbox_ = new Melown.BBox(0,0,0,1,1,1);

    return { bbox_:bbox_, vertices_:vertices_, uvs_: uvs_};
};

Melown.RendererGeometry.makeQuad = function(lon1_, lat1_, lon2_, lat2_, vertices_, index_, uvs_, index2_) {
    var g = Melown.RendererGeometry;
    var a = g.spherePos(lon1_, lat1_), ta = [lon1_, lat1_];
    var b = g.spherePos(lon1_, lat2_), tb = [lon1_, lat2_];
    var c = g.spherePos(lon2_, lat1_), tc = [lon2_, lat1_];
    var d = g.spherePos(lon2_, lat2_), td = [lon2_, lat2_];
    g.setFaceVertices(vertices_, b, a, c, index_);
    g.setFaceUVs(uvs_, tb, ta, tc, index2_);
    g.setFaceVertices(vertices_, c, d, b, index_+9);
    g.setFaceUVs(uvs_, tc, td, tb, index2_+6);
};



