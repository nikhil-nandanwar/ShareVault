import { motion } from 'framer-motion';
import Badge from '../ui/Badge';
import { Icon } from '../ui/Icon';

function Hero() {
    return (
        <section className="relative isolate overflow-hidden pt-12 pb-8 sm:pt-16 sm:pb-12">
            <div className="absolute inset-0 -z-10 app-grid opacity-60" aria-hidden="true" />

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="mx-auto max-w-3xl text-center"
            >
                <Badge variant="brand" className="mb-4">
                    <Icon name="sparkle" className="h-3.5 w-3.5" />
                    Free · No signup · Cross-device
                </Badge>

                <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                    Share text and files in{' '}
                    <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        four digits
                    </span>
                    .
                </h1>

                <p className="text-balance mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                    Drop a snippet or upload a file, get a short code, and pick it up
                    on any other device — instantly and securely.
                </p>

                <div className="mt-7 flex items-center justify-center gap-6 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                        <Icon name="bolt" className="h-4 w-4 text-indigo-500" />
                        Instant
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Icon name="lock" className="h-4 w-4 text-indigo-500" />
                        Private
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Icon name="sparkle" className="h-4 w-4 text-indigo-500" />
                        Effortless
                    </span>
                </div>
            </motion.div>
        </section>
    );
}

export default Hero;
