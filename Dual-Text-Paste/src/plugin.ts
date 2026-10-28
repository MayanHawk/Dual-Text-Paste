
import streamDeck from "@elgato/streamdeck";

import { DualTextPaste } from "./actions/increment-counter";

streamDeck.logger.setLevel("info");

streamDeck.actions.registerAction(new DualTextPaste());

streamDeck.connect();
