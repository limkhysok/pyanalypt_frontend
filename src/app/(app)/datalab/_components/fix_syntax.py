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

    # Fix the trailing comma issue: replace `,,` or `,\s*,` with `,`
    content = re.sub(r',\s*,', ',', content)
    
    # Fix the `\n, asPanel` issue:
    content = re.sub(r'\n\s*,\s*asPanel', ', asPanel', content)

    # Make `open` and `onOpenChange` optional in the prop types
    content = re.sub(r'open:\s*boolean;', r'open?: boolean;', content)
    content = re.sub(r'onOpenChange:\s*\(\w+:\s*boolean\)\s*=>\s*void;', r'onOpenChange?: (open: boolean) => void;', content)
    
    # Provide default for onOpenChange if missing
    # Match something like `open, onOpenChange, datasetId` and replace with `open, onOpenChange = () => {}, datasetId`
    content = re.sub(r'\bonOpenChange(?![\s]*=)', r'onOpenChange = () => {}', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed {filename}")
