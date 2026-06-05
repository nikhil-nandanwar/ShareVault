"use client";

import { FormEvent, useState } from "react";

export default function TextUploadPage() {
	const [text, setText] = useState("");

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log("Uploading text:", text);
		try{
			
		}catch(error){
			console.error("Error uploading text:", error);
		}
	};

	return (
		<main className="flex items-center justify-center bg-gray-50 p-6">
			<form
				onSubmit={handleSubmit}
				className="w-full max-w-4xl rounded-2xl border border-gray-300 bg-white p-6 shadow-sm"
			>
				<h1 className="mb-4 text-2xl font-semibold text-gray-900">
					Upload Text
				</h1>

				<label
					htmlFor="text-upload"
					className="mb-2 block text-sm font-medium text-gray-700"
				>
					Enter text to upload
				</label>

				<textarea
					id="text-upload"
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="Paste or type your text here..."
					className=" w-full rounded-xl border border-gray-300 p-4 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				/>

				<div className="mt-4 flex justify-end">
					<button
						type="submit"
						className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
					>
						Upload Text
					</button>
				</div>
			</form>
		</main>
	);
}
