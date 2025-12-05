import AsciiCommand from "./ascii"
import BillCommand from "./bill"
import ChessCommand from "./chess"
import GnomeCommand from "./gnome"
import SourceCommand from "./source"
import { Command } from "./types"

export const commands: Command[] = [
  AsciiCommand,
  BillCommand,
  ChessCommand,
  GnomeCommand,
  SourceCommand
]
