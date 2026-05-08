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
    CodeDisplay,
    Icon,
    Textarea,
} from '../../ui';
import { uploadText } from '../../../services/shareService';

const MAX_LENGTH = 10000;

function TextUploadSection() {
    const [textContent, setTextContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');

    const handleReset = () => {
        setTextContent('');
        setGeneratedCode('');
        setError('');
    };

    const handleSubmit = async () => {
        if (!textContent.trim()) {
            setError('Please enter some text to share.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const { code } = await uploadText(textContent);
            setGeneratedCode(code);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Share text</CardTitle>
                    <CardDescription>
                        Paste a snippet, link, or note. We&apos;ll give you a 4-digit
                        code anyone can use to retrieve it.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Textarea
                        rows={8}
                        value={textContent}
                        onChange={(e) =>
                            setTextContent(e.target.value.slice(0, MAX_LENGTH))
                        }
                        placeholder="Paste or type your text here…"
                        invalid={Boolean(error)}
                    />

                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Plain text only · stays private to your code</span>
                        <span aria-live="polite">
                            {textContent.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
                        </span>
                    </div>

                    <AnimatePresence>
                        {error && <Alert variant="error">{error}</Alert>}
                    </AnimatePresence>

                    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
                        <Button
                            variant="secondary"
                            onClick={handleReset}
                            disabled={loading || (!textContent && !generatedCode)}
                            leftIcon={<Icon name="refresh" className="h-4 w-4" />}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="brand"
                            onClick={handleSubmit}
                            loading={loading}
                            rightIcon={!loading ? <Icon name="arrowRight" className="h-4 w-4" /> : null}
                        >
                            {loading ? 'Generating code…' : 'Generate code'}
                        </Button>
                    </div>

                    <AnimatePresence>
                        {generatedCode && (
                            <CodeDisplay
                                code={generatedCode}
                                helpText="Share this code with anyone — they can paste it on the Retrieve tab."
                            />
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.section>
    );
}

export default TextUploadSection;
