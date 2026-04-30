import os
import re

files = [
    "TransformDialog.tsx",
    "OutlierDialog.tsx",
    "NullHandlingDialog.tsx",
    "DropDuplicatesDialog.tsx",
    "ColumnToolsDialog.tsx",
    "CleanFilterDialog.tsx",
]

base_dir = r"c:\Users\limkhi-laptop\Desktop\pyanalypt\pyanalypt_frontend\src\app\(app)\datalab\_components"

for filename in files:
    filepath = os.path.join(base_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add asPanel to prop destructuring
    # export function XDialog({ open, onOpenChange, datasetId ...
    content = re.sub(r'(export function \w+Dialog\(\{)([^}]*?)(\}:)', 
                     lambda m: m.group(1) + m.group(2) + (', asPanel' if 'asPanel' not in m.group(2) else '') + m.group(3), 
                     content, count=1)

    # 2. Add asPanel?: boolean; to prop types
    content = re.sub(r'(\}\s*>\s*\(\s*\{[^}]+\}\s*:\s*Readonly\s*<\s*\{)', 
                     lambda m: m.group(1) + '\n    asPanel?: boolean;', 
                     content, count=1)
    # Some don't have the Readonly<{ on a separate line or match differently
    content = re.sub(r'(open\??:\s*boolean;\s*onOpenChange\??:\s*\(open:\s*boolean\)\s*=>\s*void;)',
                     r'\1\n    asPanel?: boolean;', content)

    # 3. Extract the return statement
    # Find: return (\s*<Dialog open={open} onOpenChange={[^}]*}>\s*<DialogContent[^>]*>)(.*?)(</DialogContent>\s*</Dialog>\s*);
    match = re.search(r'return\s*\(\s*<Dialog\s+open=\{open\}\s+onOpenChange=\{([^}]+)\}\s*>\s*<DialogContent([^>]*)>(.*?)</DialogContent>\s*</Dialog>\s*\);', content, re.DOTALL)
    if match:
        on_open_change = match.group(1)
        dialog_content_attrs = match.group(2)
        inner_content = match.group(3)

        new_return = f"""
    const inner = (
        <>{inner_content}</>
    );

    if (asPanel) {{
        return (
            <div className="border border-border/60 p-5 bg-background h-full">
                {{inner}}
            </div>
        );
    }}

    return (
        <Dialog open={{open}} onOpenChange={{{on_open_change}}}>
            <DialogContent{dialog_content_attrs}>
                {{inner}}
            </DialogContent>
        </Dialog>
    );
"""
        content = content[:match.start()] + new_return + content[match.end():]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed asPanel logic for {filename}")
