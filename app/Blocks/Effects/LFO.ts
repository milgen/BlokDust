import IEffect = require("../IEffect");
import IModifiable = require("../IModifiable");


class LFO implements IEffect {

    _LFO: Tone.LFO;

    constructor() {
        this._LFO = new Tone.LFO(5, 440, 660);
        this._LFO.setType("triangle");
    }

    Connect(modifiable: IModifiable): void{

        this._LFO.connect(modifiable.Osc.frequency);
        this._LFO.start();

    }

    Disconnect(modifiable: IModifiable): void {
        this._LFO.disconnect();

        //NOTE: When you disconnect an LFO you need to reset the Frequency (this may be a bug in tone.js)
        modifiable.Osc.setFrequency(440); //TODO: set to original the original frequency
    }
}

export = LFO;