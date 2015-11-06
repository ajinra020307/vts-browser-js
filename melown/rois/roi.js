/**
 * A ROI instance constructor (Protected constructor. Don't use this constructor)
 * directly. Use Fetch method of Melown.Roi class or constructor of specific
 * Roi type.
 * @constructor
 */
Melown.Roi = function(config_, core_) {
    this.config_ = config_;
    this.core_ = core_;
    
    this.renderer_ = this.core_.renderer_;
    this.map_ = this.core_.map_;

    // state properties
    this.state_ = Melown.Roi.State.Created;
    this.develAtFinishRequested_ = false;
    this.leaveAtFinishRequested_ = false;
    this.enterPosition_ = null;             // filled by devel function
    this.refPosition_ = null;               // filled from config JSON 
    this.currendPosition_ = null;           // changing by orientation accesor etc.

    // inti roi point
    this._init();
}

Melown.Roi.Fetch = function(config_, core_, clb_) {
    var done = function(json_) {
        if (typeof json_ === 'object' && json_ !== null) {
            if (typeof json_['type'] === 'string' 
                && typeof Melown.Roi.Type[json_.type] === 'function') {
                clb_(null, new Melown.Roi.Type[json_['type']](json_, core_));
            } else {
                var err = new Error('Downloaded configuration JSON does not contain registered ROI type');
                console.error(err);
                clb(err);
                return;
            }
        }
        var err = new Error('Downloaded configuration is not JSON object');
        console.error(err);
        clb(err);
        return;
    }

    if (typeof config_ === 'string') {
        // async load of config at URL and call processConfig again (with object)
        // TODO - Vadstena.loadJSON should be replaced by Melown.*
        Vadstena.loadJSON(config_, done, function(error_) {
            var err = new Error('Unable to download configuration JSON');
            console.error(err);
            clb(err);
            return;
        });
    } else if (typeof config_ !== 'object' 
        || config_ === null) {
        var err = new Error('Unknown configuration format passed to Pano browser')
        console.error(err);
        clb(err);
        return;
    }

    done(config_);
}

/**
 * To be fullfilled by specific roi types [type : class]
 */
Melown.Roi.Type = {}

/**
 * Roi object states.
 * @enum {number}
 */
Melown.Roi.State = {
    Created : 0,
    Ready : 1,
    FadingIn : 2,
    Presenting : 3,
    FadingOut : 4,
    Error : -1
}

// Public methods

Melown.Roi.delve = function(enterPosition_) {
    if (this.state_ === Melown.Roi.State.Created 
        || this.state_ === Melown.Roi.State.FadingOut) {
        this.develAtFinishRequested_ = true;
    } else if (this.state_ === Melown.Roi.State.FadingIn) {
        this.leaveAtFinishRequested_ = false;
    } else if (this.state_ !== Melown.Roi.State.Ready) {
        return;
    }

    // TODO flight into roi position and blend with custom render
}

Melown.Roi.leave = function() {
    if (this.state_ === Melown.Roi.State.Created 
        || this.state_ === Melown.Roi.State.FadingOut) {
        this.develAtFinishRequested_ = false;
    } else if (this.state_ === Melown.Roi.State.FadingIn) {
        this.leaveAtFinishRequested_ = true;
    } else if (this.state_ !== Melown.Roi.State.Ready) {
        return;
    }

    // TODO flight into roi position and blend with custom render
}

// Accessor methods

Melown.Roi.prototype.state = function() {
    return this.state_;
}

Melown.Roi.prototype.config = function() {
    return this.config_;
}

Melown.Roi.currentPosition = function(type_ = 'obj') {
    if (type_ === 'obj') {
        return this.currendPosition_;
    }
    return this.map_.convert(this.currendPosition_, type);
}

Melown.Roi.orientation = function(yaw, pitch) {
    if (yaw === undefined) {
        // TODO get current yaw and pitch
        return [0, 0];
    } else if (pitch === undefined) {
        if (yaw instanceof Array && yaw.length >= 2) {
            pitch = yaw[1]; 
            yaw = yaw[0];
        } else {
            pitch = this.orientation[1];
        }
    }
    // TODO set current position from given yaw and pitch
}

// Protected methods

/**
 * Parent class (this class) _init method MUST be caled from overidden method. 
 */
Melown.Roi.prototype._init = function() {
    // Process configuration file
    if (typeof this.config_ !== 'object' || type.config_ === null) {
        this.state_ = Melown.Roi.State.Error;
        var err = new Error('Config passed to ROI constructor is not object');
        console.error(err);
        return;
    }
    this._processConfig();
    
    // If processing of configuration is successfull 
    // (configuration JSON is valid) proceed to finalize initialization
    if (this.state_ != Melown.Roi.State.Error) {
        this._initFinalize();
    }
}

/**
 * Parent class (this class) _init method MUST be caled from overidden method. 
 */
Melown.Roi.prototype._processConfig = function() {
    var err = null;
    if (typeof this.config_['id'] !== 'string') {
        err = new Error('Missing (or type error) ROI id in config JSON');
    } else if (this instanceof Melown.Roi.Type[this.config_['type']]) {
        err = new Error('ROI type in config JSON missing or is not registered');
    } else if (!this.config_['position'] instanceof Array
               || !this.core_.map_.positionSanity(this.config_['position'])) {
        err = new Error('ROI position in config JSON missing or is not valid');
    } else if (typeof this.config_['title'] !== 'string') {
        err = new Error('Missing (or type error) ROI title in config JSON');
    }

    if (err !== null) {
        this.state_ = Melown.Roi.State.Error;
    }
}

/**
 * Parent class (this class) _init method MUST be caled from overidden method. 
 */
Melown.Roi.prototype._initFinalize = function() {
    // Change state and go ...
    this.state_ = Melown.Roi.State.Ready;

    if (this.develAtFinishRequested_) {
        this.develAtFinishRequested_ = false;
        this.devel();
    }
}