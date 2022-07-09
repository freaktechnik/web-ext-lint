import core from '@actions/core';
import webExt from 'web-ext';
import qs from 'node:querystring';
import path from 'node:path';

const NONE = 0,
    FIRST = 1,
    source = core.getInput('extension-root') || '.',
    privileged = core.getInput('privileged') || false,
    selfHosted = /true/.test(core.getInput('self-hosted'));
//TODO support explicit config path?

function report(level, info, message) {
    const meta = qs.stringify(info, ',', '=', {
        encodeURIComponent: (string) => string
    });
    core.info(`::${level} ${meta}::${message}`);
}

function formatLocation(lintReport) {
    return [
        lintReport.file,
        lintReport.line,
        lintReport.column
    ].filter((exists) => !!exists)
        .join(':');
}

function formatMessage(lintReport) {
    const verbose = /true/.test(core.getInput('verbose'));
    if(verbose) {
        return `${lintReport.message} - ${lintReport.description}`;
    }
    return lintReport.message;
}

webExt.cmd.lint({
    sourceDir: source,
    output: 'none',
    privileged,
    selfHosted
},
{
    shouldExitProgram: false
})
    .then((lintResult) => {
        if(lintResult.errors.length > NONE) {
            core.startGroup('Errors');
            for(const error of lintResult.errors) {
                if(error.file) {
                    report('error', {
                        file: path.join(source, error.file),
                        line: error.line || FIRST,
                        col: error.column || FIRST
                    }, formatMessage(error));
                }
                else {
                    core.error(formatMessage(error));
                }
            }
            core.endGroup();
        }
        if(lintResult.warnings.length) {
            core.startGroup('Warnings');
            for(const warning of lintResult.warnings) {
                if(warning.file) {
                    report('warning', {
                        file: path.join(source, warning.file),
                        line: warning.line || FIRST,
                        col: warning.column || FIRST
                    }, formatMessage(warning));
                }
                else {
                    core.warning(formatMessage(warning));
                }
            }
            core.endGroup();
        }
        if(lintResult.notices.length) {
            core.startGroup('Notices');
            for(const notice of lintResult.notices) {
                core.info(`${formatLocation(notice)} ${formatMessage(notice)}`);
            }
            core.endGroup();
        }
        if(lintResult.summary.errors > NONE) {
            core.setFailed(`${lintResult.summary.errors} error(s) were reported by web-ext`);
        }
    })
    .catch((error) => core.setFailed(error.message));
