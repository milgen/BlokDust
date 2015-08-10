import Keyboard = require("./Keyboard");
import Voice = require("./VoiceObject");
import ISource = require("../ISource");
import Grid = require("../../Grid");
import Stage = require("../../Stage");
import KeyDownEventArgs = require("../../Core/Inputs/KeyDownEventArgs");
import Microphone = require("../Sources/Microphone");
import Power = require("../Power/Power");

class ComputerKeyboard extends Keyboard {

    public KeyboardCommands: any = {
        OctaveUp: 'octave-up',
        OctaveDown: 'octave-down',
    };
    public Params: KeyboardParams;

    Init(sketch?: any): void {

        if (!this.Params) {
            this.Params = {
                octave: 3,
                glide: 0.05,
                isPolyphonic: false,
            };
        }

        super.Init(sketch);

        App.KeyboardInput.KeyDownChange.on(this.KeyDownCallback, this);
        App.KeyboardInput.KeyUpChange.on(this.KeyUpCallback, this);

        // Define Outline for HitTest
        this.Outline.push(new Point(-1, 0),new Point(0, -1),new Point(2, 1),new Point(1, 2),new Point(-1, 2));
    }


    Draw() {
        super.Draw();
        (<Stage>this.Sketch).BlockSprites.Draw(this.Position, true, "computer keyboard");
    }

    Attach(source: ISource): void {
        super.Attach(source);


    }

    Detach(source: ISource): void {
        source.TriggerRelease('all');
        super.Detach(source);
    }

    Dispose(){
        super.Dispose();
        this.Params.octave = null;
        this.KeyboardCommands = null;
        App.KeyboardInput.KeyDownChange.off(this.KeyDownCallback, this);
        App.KeyboardInput.KeyUpChange.off(this.KeyUpCallback, this);
    }

    KeyDownCallback(e: any){

        //if KeyDown is a keyboard note or an octave shifter
        if (e.KeyDown && e.KeyDown.substring(0, 5) === 'note_'){
            this.KeysDown = e.KeysDown;

            // FOR ALL SOURCES TRIGGER KEYBOARD DOWN
            for (var i = 0; i < this.Sources.Count; i++) {
                var source = this.Sources.GetValueAt(i);
                this.KeyboardDown(e.KeyDown, source);
            }
        } else {
            //for (var i = 0; i < this.Sources.Count; i++) {
            //    var source = this.Sources.GetValueAt(i);
                this._ExecuteKeyboardCommand(e.KeyDown, this.Sources);
            //}
        }
    }

    KeyUpCallback(e: any){

        // FOR ALL SOURCES TRIGGER KEYBOARD UP
        for (var i = 0; i < this.Sources.Count; i++) {
            var source = this.Sources.GetValueAt(i);

            // If its an octave shift no need to call KeyboardUp
            if (e.KeyUp && e.KeyUp.substring(0, 5) === 'note_') {
                this.KeyboardUp(e.KeyUp, source);
            }
        }

        this.KeysDown = e.KeysDown;
    }

    // OCTAVE SHIFT //
    private _ExecuteKeyboardCommand(key: string, sources: any) {
        if (key == 'octave-up' && this.Params.octave < 9) {
            for (var i = 0; i < sources.Count; i++) {
                var source = this.Sources.GetValueAt(i);
                source.OctaveShift(1);
            }
            this.Params.octave++;
            this.RefreshOptionsPanel();
        } else if (key === 'octave-down' && this.Params.octave != 0) {
            for (var i = 0; i < sources.Count; i++) {
                var source = this.Sources.GetValueAt(i);
                source.OctaveShift(-1);
            }
            this.Params.octave--;
            this.RefreshOptionsPanel();
        }
    }

    KeyboardDown(keyDown:string, source:ISource): void {

        var keyPressed = this.GetKeyNoteOctaveString(keyDown);
        var frequency = this.GetFrequencyOfNote(keyPressed, source);

        if (this.Params.isPolyphonic) {
            // POLYPHONIC MODE

            // Are there any free voices?
            if (source.FreeVoices.length > 0){

                // Yes, get one of them and remove it from FreeVoices list
                var voice = source.FreeVoices.shift();

                // Store the keydown
                voice.Key = keyDown;

                // Add it to the ActiveVoices list
                source.ActiveVoices.push( voice );

                // set it to the right frequency
                source.SetPitch(frequency, voice.ID);

                // trigger it's envelope
                source.TriggerAttack(voice.ID);

            } else {

                // No free voices available - steal the oldest one from active voices
                var voice: Voice = source.ActiveVoices.shift();

                // Store the keydown
                voice.Key = keyDown;

                // Set the new pitch
                source.SetPitch(frequency, voice.ID);

                // Add it back to the end of ActiveVoices
                source.ActiveVoices.push( voice );
            }

        } else {
            // MONOPHONIC MODE

            // If no other keys already pressed trigger attack
            if (Object.keys(this.KeysDown).length === 1) {
                source.SetPitch(frequency);
                source.TriggerAttack();

                // Else ramp to new frequency over time (glide)
            } else {
                source.SetPitch(frequency, 0, this.Params.glide);
            }
        }
    }

    KeyboardUp(keyUp:string, source:ISource): void {

        if (this.Params.isPolyphonic) {
            // POLYPHONIC MODE

            // Loop through all the active voices
            source.ActiveVoices.forEach((voice: Voice, i: number) => {

                // if key pressed is a saved in the ActiveVoices stop it
                if (voice.Key === keyUp) {
                    // stop it
                    source.TriggerRelease(voice.ID);

                    // Remove voice from Active Voices
                    source.ActiveVoices.splice(i, 1);

                    // Add it to FreeVoices
                    source.FreeVoices.push(voice);
                }
            });

        } else {
           // MONOPHONIC MODE

            if (Object.keys(this.KeysDown).length === 0) {
                source.TriggerRelease();
            }
        }
    }



    UpdateOptionsForm() {
        super.UpdateOptionsForm();

        this.OptionsForm =
        {
            "name" : "Computer Keyboard",
            "parameters" : [

                {
                    "type" : "switches",
                    "name" : "",
                    "switches": [
                        {
                            "name" : "Mono/Poly",
                            "setting" :"polyphonic",
                            "value": this.Params.isPolyphonic,
                            "mode": "fewMany"
                        }
                    ]
                },
                /*{
                    "type" : "buttons",
                    "name" : "Mode",
                    "setting" :"polyphonic",
                    "props" : {
                        "value" : this.Params.isPolyphonic,
                        "mode" : "string"
                    },
                    "buttons": [
                        {
                            "name" : "Mono"
                        },
                        {
                            "name" : "Poly"
                        }
                    ]
                },*/
                {
                    "type" : "slider",
                    "name" : "Octave",
                    "setting" :"octave",
                    "props" : {
                        "value" : this.Params.octave,
                        "min" : 0,
                        "max" : 9,
                        "quantised" : true,
                        "centered" : false
                    }
                },
                {
                    "type" : "slider",
                    "name" : "Glide",
                    "setting" :"glide",
                    "props" : {
                        "value" : this.Params.glide*100,
                        "min" : 0.001,
                        "max" : 100,
                        "truemin" : 0,
                        "truemax" : 1,
                        "quantised" : false,
                        "centered" : false
                    }
                },
            ]
        };
    }


}

export = ComputerKeyboard;