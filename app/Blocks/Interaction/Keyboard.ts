import PreEffect = require("../Effects/PreEffect");
import ISource = require("../ISource");
import Grid = require("../../Grid");
import KeyDownEventArgs = require("../../Core/Inputs/KeyDownEventArgs");
import PitchComponent = require("./../Effects/Pre/Pitch");

/**
 * Base class for mono, poly and midi keyboards
 */
class Keyboard extends PreEffect {

    public BaseFrequency: number;
    public CurrentOctave: number;
    public KeysDown: any;

    Init(sketch?: Fayde.Drawing.SketchContext): void {
        super.Init(sketch);

        this.KeysDown = {};
        this.CurrentOctave = 3;
        App.KeyboardInput.KeyDownChange.on(this.KeyDownCallback, this);
        App.KeyboardInput.KeyUpChange.on(this.KeyUpCallback, this);

        // Define Outline for HitTest
        this.Outline.push(new Point(-1, 0),new Point(0, -1),new Point(2, 1),new Point(1, 2),new Point(-1, 2));
    }

    Draw() {
        super.Draw();
    }

    Attach(source:ISource): void{
        super.Attach(source);
        this.SetBaseFrequency(source);
        this.KeysDown = {};
    }

    Detach(source:ISource): void {

        // FOR ALL SOURCES
        for (var i = 0; i < this.Sources.Count; i++) {
            var source = this.Sources.GetValueAt(i);

            if (this.IsPressed){
                source.Envelopes.forEach((e: Tone.AmplitudeEnvelope) => {
                    e.triggerRelease();
                });

            }

            source.Sources.forEach((s: any) => {
                if (s.frequency){
                    s.frequency.value = source.Frequency;
                }
            });

        }

        super.Detach(source);
    }

    KeyDownCallback(e){

        //if KeyDown is a keyboard note or an octave shifter
        if ((<any>e).KeyDown.substring(0, 5) === 'note_' || (<any>e).KeyDown === 'octave-up' ||  (<any>e).KeyDown === 'octave-down'){
            this.KeysDown = (<any>e).KeysDown;

            // FOR ALL SOURCES TRIGGER KEYBOARD DOWN
            for (var i = 0; i < this.Sources.Count; i++) {
                var source = this.Sources.GetValueAt(i);
                this.KeyboardDown((<any>e).KeyDown, source);
            }
        }
    }

    KeyUpCallback(e){

        // FOR ALL SOURCES TRIGGER KEYBOARD UP
        for (var i = 0; i < this.Sources.Count; i++) {
            var source = this.Sources.GetValueAt(i);

            // If its an octave shift no need to call KeyboardUp
            if ((<any>e).KeyUp !== 'octave-up' && (<any>e).KeyUp !== 'octave-down') {
                this.KeyboardUp((<any>e).KeyUp, source);
            }
        }

        this.KeysDown = (<any>e).KeysDown;
    }

    Dispose(){
        this.KeysDown = {};
        this.BaseFrequency = null;
        this.CurrentOctave = null;
        App.KeyboardInput.KeyDownChange.off(this.KeyDownCallback, this);
        App.KeyboardInput.KeyUpChange.off(this.KeyUpCallback, this);
    }

    SetParam(param: string,value: number) {
        super.SetParam(param,value);

        if (param == "octave"){
            this.TriggerReleaseAll();
            this.CurrentOctave = value;
        }
    }

    GetParam(param: string) {
        super.GetParam(param);
    }

    UpdateOptionsForm() {
        super.UpdateOptionsForm();

        this.OptionsForm =
        {
            "name" : "Mono Keyboard",
            "parameters" : [

                {
                    "type" : "slider",
                    "name" : "Glide",
                    "setting" :"glide",
                    "props" : {
                        "value" : this.GetParam("glide"),
                        "min" : 0.001,
                        "max" : 100,
                        "truemin" : 0,
                        "truemax" : 1,
                        "quantised" : false,
                        "centered" : false
                    }
                }
            ]
        };
    }

    KeyboardDown(key:string, source:ISource): void {
        if (key == 'octave-up' && this.CurrentOctave < 9) {
            this.CurrentOctave++;
        }

        if (key === 'octave-down' && this.CurrentOctave != 0) {
            this.CurrentOctave--;
        }
    }

    KeyboardUp(key:string, source:ISource): void {

    }

    public SetBaseFrequency(source:ISource){

        if (source.Frequency){
            this.BaseFrequency = source.Frequency;
        } else {
            this.BaseFrequency = 440;
        }
    }

    public GetStartOctave(source): number {
        var octave,
            note = source.Source.frequencyToNote(this.BaseFrequency);

        if (note.length === 3) {
            octave = parseInt(note.charAt(2));
        } else {
            octave = parseInt(note.charAt(1));
        }

        return octave;
    }

    public GetKeyNoteOctaveString(keyCode): string {
        // Replaces keycode with keynote & octave string
        return (keyCode
            .replace('note_', '')
            .replace('_a', this.CurrentOctave)
            .replace('_b', this.CurrentOctave + 1)
            .replace('_c', this.CurrentOctave + 2)
            .replace('_d', this.CurrentOctave + 3)
            .toString());
    }

    public GetFrequencyOfNote(note, source): number {
        return source.Sources[0].noteToFrequency(note) * this.GetConnectedPitchPreEffects(source);
    }

    public GetConnectedPitchPreEffects(source) {

        var totalPitchIncrement = 1;

        for (var i = 0; i < source.Effects.Count; i++) {
            var effect = source.Effects.GetValueAt(i);

            if (effect instanceof PitchComponent) {
                var thisPitchIncrement = (<PitchComponent>effect).PitchIncrement;
                totalPitchIncrement *= thisPitchIncrement;
            }
        }

        return totalPitchIncrement;
    }

}

export = Keyboard;