import { dataFileList, publicDataDir } from './datafiles.js'
import { dovecotMdInit } from './markdown.js'
import { logger } from './logger.js'
import fs from 'fs'

let has_run = false

export default function dovecotVitepressInit() {
        return {
                name: 'dovecot-vitepress-init',
                async configResolved(config) {
                        /*** Init Dovecot Markdown. ***/

                        /* We need to synchronously initialize markdown,
                         * since we need to pre-populate various internal
                         * tables (e.g. links). */
                        await dovecotMdInit()
                        logger.success('Dovecot Markdown initialized', { once: true })

                        /*** Create static downloadable data files. ***/

                        if (has_run) return
                        has_run = true

                        /* Clean old data files (if they exist) and prepare directory. */
                        fs.rmSync(publicDataDir, { force: true, recursive: true });
                        fs.mkdirSync(publicDataDir, { recursive: true });
                        logger.success(`Data files: Created ${publicDataDir}`)

                        /* Build the data files. */
                        for (const d of dataFileList) {
                                fs.writeFileSync(
                                        d.json,
                                        JSON.stringify(await d.data(), null, 2)
                                )
                                logger.success(`Data files: Generated ${d.json}`)
                        }
                }
        }
}
