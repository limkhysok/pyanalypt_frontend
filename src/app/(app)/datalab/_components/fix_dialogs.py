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

    # Replace tags first
    # <DialogHeader className="..."> -> <div className="flex flex-col space-y-1.5 text-center sm:text-left ...">
    content = re.sub(r'<DialogHeader(?:\s+className="([^"]+)")?>', 
                     lambda m: f'<div className="flex flex-col space-y-1.5 text-center sm:text-left{" " + m.group(1) if m.group(1) else ""}">' , content)
    content = content.replace('</DialogHeader>', '</div>')

    content = re.sub(r'<DialogTitle(?:\s+className="([^"]+)")?>', 
                     lambda m: f'<h2 className="text-lg font-semibold leading-none tracking-tight{" " + m.group(1) if m.group(1) else ""}">' , content)
    content = content.replace('</DialogTitle>', '</h2>')

    content = re.sub(r'<DialogDescription(?:\s+className="([^"]+)")?>', 
                     lambda m: f'<p className="text-sm text-muted-foreground{" " + m.group(1) if m.group(1) else ""}">' , content)
    content = content.replace('</DialogDescription>', '</p>')

    content = re.sub(r'<DialogFooter(?:\s+className="([^"]+)")?>', 
                     lambda m: f'<div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2{" " + m.group(1) if m.group(1) else ""}">' , content)
    content = content.replace('</DialogFooter>', '</div>')

    # Remove the imports properly
    content = re.sub(r'\bDialogHeader,?\s*', '', content)
    content = re.sub(r'\bDialogTitle,?\s*', '', content)
    content = re.sub(r'\bDialogDescription,?\s*', '', content)
    content = re.sub(r'\bDialogFooter,?\s*', '', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed {filename}")
