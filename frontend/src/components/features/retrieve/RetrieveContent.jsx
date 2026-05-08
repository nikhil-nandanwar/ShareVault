import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Alert,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Icon,
} from '../../ui';
import CodeInput, { CODE_LENGTH } from './CodeInput';
import RetrievedTextPanel from './RetrievedTextPanel';
import RetrievedFilesPanel from './RetrievedFilesPanel';
import { getContent } from '../../../services/shareService';

function RetrieveContent() {
    const [code, setCode] = useState('');
    const [content, setContent] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (code.length !== CODE_LENGTH) {
            setError('Please enter the full 4-digit code.');
            return;
        }

        setLoading(true);
        setError('');
        setContent(null);

        try {
            const data = await getContent(code);
            setContent(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setCode('');
        setContent(null);
        setError('');
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Retrieve content</CardTitle>
                    <CardDescription>
                        Enter a 4-digit code to open the text or files shared with you.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <CodeInput value={code} onChange={setCode} disabled={loading} />

                        <AnimatePresence>
                            {error && <Alert variant="error">{error}</Alert>}
                        </AnimatePresence>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center sm:gap-3">
                            {(code || content) && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleClear}
                                    disabled={loading}
                                    leftIcon={<Icon name="refresh" className="h-4 w-4" />}
                                >
                                    Clear
                                </Button>
                            )}
                            <Button
                                type="submit"
                                variant="brand"
                                loading={loading}
                                disabled={code.length !== CODE_LENGTH}
                                rightIcon={
                                    !loading ? <Icon name="arrowRight" className="h-4 w-4" /> : null
                                }
                            >
                                {loading ? 'Retrieving…' : 'Retrieve'}
                            </Button>
                        </div>
                    </form>

                    <AnimatePresence>
                        {content && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-8 space-y-4 border-t border-slate-100 pt-6"
                            >
                                <h3 className="text-sm font-semibold text-slate-700">
                                    {content.type === 'text' ? 'Retrieved text' : 'Retrieved files'}
                                </h3>
                                {content.type === 'text' ? (
                                    <RetrievedTextPanel content={content.content} />
                                ) : (
                                    <RetrievedFilesPanel
                                        code={code}
                                        files={content.files}
                                        onError={setError}
                                    />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.section>
    );
}

export default RetrieveContent;
