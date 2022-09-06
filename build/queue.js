"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initJob = exports.defineJob = void 0;
const agenda_1 = require("agenda");
const config_1 = require("./config");
const agenda = new agenda_1.Agenda({
    db: { address: config_1.Env.MONGO_URL, collection: "jobs" },
});
function defineJob(name, processor) {
    agenda.define(name, processor);
}
exports.defineJob = defineJob;
function initJob(name, data) {
    agenda.now(name, data);
}
exports.initJob = initJob;
exports.default = agenda;
