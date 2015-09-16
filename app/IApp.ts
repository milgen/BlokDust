import AnimationsLayer = require("./UI/AnimationsLayer");
import {Audio} from './Core/Audio/Audio';
import ColorThemes = require("./UI/ColorThemes");
import CommandManager = require("./Core/Commands/CommandManager");
import CommandsInputManager = require("./Core/Inputs/CommandsInputManager");
import Config = require("./Config");
import DragFileInputManager = require("./Core/Inputs/DragFileInputManager");
import IBlock = require("./Blocks/IBlock");
import IEffect = require("./Blocks/ISource");
import InputManager = require("./Core/Inputs/InputManager");
import ISource = require("./Blocks/ISource");
import KeyboardInput = require("./Core/Inputs/KeyboardInputManager");
import MainScene = require("./MainScene");
import Metrics = require("./AppMetrics");
import OperationManager = require("./Core/Operations/OperationManager");
import Particle = require("./Particle"); // todo: should be IParticle
import PointerInputManager = require("./Core/Inputs/PointerInputManager");
import PooledFactoryResource = require("./Core/Resources/PooledFactoryResource");
import ResourceManager = require("./Core/Resources/ResourceManager");
import Serializer = require("./Serializer");
import Splash = require("./Splash");
import TypingManager = require("./Core/Inputs/TypingManager");

interface IApp {
    Audio: Audio;
    AnimationsLayer: AnimationsLayer;
    Blocks: IBlock[];
    Canvas: HTMLCanvasElement;
    Color: ColorThemes;
    Config: Config;
    CommandManager: CommandManager;
    CommandsInputManager: CommandsInputManager;
    CompositionId: string;
    Ctx: any;  //todo: typing as CanvasRenderingContext2D causes "Property 'fillStyle' is missing in type 'WebGLRenderingContext'"
    DragFileInputManager: DragFileInputManager;
    DragOffset: Point;
    Effects: IEffect[];
    GridSize: number;
    Height: number;
    InputManager: InputManager;
    KeyboardInput: KeyboardInput;
    LoadCued: boolean;
    MainScene: MainScene;
    Metrics: Metrics;
    OperationManager: OperationManager;
    Palette: string[];
    Particles: Particle[];
    ParticlesPool: PooledFactoryResource<Particle>;
    PointerInputManager: PointerInputManager;
    ResourceManager: ResourceManager;
    ScaledDragOffset: Point;
    ScaledGridSize: number;
    ScaledUnit: number;
    Scene: number;
    SessionId: string;
    Sources: ISource[];
    Splash: Splash;
    SubCanvas: HTMLCanvasElement[];
    TypingManager: TypingManager;
    Unit: number;
    Width: number;
    ZoomLevel: number;

    Deserialize(json: string): any;
    GetBlockId(): number;
    LoadReady(): void;
    Message(message?: string, options?: any): void;
    Serialize(): string;
    Setup(): void;
}

export = IApp;