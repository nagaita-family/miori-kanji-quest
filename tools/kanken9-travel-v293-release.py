"""One-time guarded v2.9.3 integration; no existing learning or Pencil implementation is rewritten."""
from pathlib import Path

def one(src, before, after, label):
    count=src.count(before)
    if count!=1:
        raise RuntimeError(f'{label}: expected one anchor, found {count}')
    return src.replace(before,after,1)

loader_path=Path('app-v240-release.js')
loader=loader_path.read_text(encoding='utf-8')
loader=one(loader,"const VERSION='v2.9.2';","const VERSION='v2.9.3';",'release version')
loader=one(loader,"['k9PaperFlowV291','./kanken9-paper-flow-v291.css?v=2920']","['k9PaperFlowV291','./kanken9-paper-flow-v291.css?v=2920'],\n      ['k9TravelV293','./kanken9-travel-v293.css?v=2930']",'journey stylesheet')
loader=one(loader,"    './kanken9-layout-v288.js?v=2910'","    './kanken9-layout-v288.js?v=2910',\n    './kanken9-travel-v293.js?v=2930'",'journey script last')
loader_path.write_text(loader,encoding='utf-8')

html_path=Path('index.html')
html=html_path.read_text(encoding='utf-8')
assert html.count('v2.9.2')>=3,'Expected v2.9.2 html version anchors'
html=html.replace('v2.9.2','v2.9.3')
html=one(html,'./app-v240-release.js?v=2920','./app-v240-release.js?v=2930','Safari cache bust')
html_path.write_text(html,encoding='utf-8')

pages_path=Path('.github/workflows/pages.yml')
pages=pages_path.read_text(encoding='utf-8')
pages=one(pages,'          node --check app-v240-release.js','          node --check app-v240-release.js\n          node --check kanken9-travel-v293.js','journey syntax check')
pages=one(pages,'          node kanken9-v290-layout-test.cjs','          node kanken9-v290-layout-test.cjs\n          node kanken9-travel-v293.test.cjs','journey regression check')
pages_path.write_text(pages,encoding='utf-8')

readme_path=Path('README.md')
readme=readme_path.read_text(encoding='utf-8')
readme=one(readme,'- App version: **v2.8.0** — 漢検9級「漢検島」遠征','- App version: **v2.9.3** — モコの飛行機で漢検島へ遠征・島が主役のホーム画面','README version')
new_section='''## 漢検島の旅行・ホーム（v2.9.3）

- 空島の「✈️ 漢検島へ」から、**モコが機内の窓に乗っていることが分かる飛行機**で約1.5秒の移動演出。スキップ可で、動きを減らす端末設定では即座に移動。
- 到着後は島とモコを大きく表示し、「きょうの10分遠征」を主導線にする。その他の練習・家具・着せ替え・パスポートは「ほかの冒険・もようがえを見る」の開閉メニューへ。受け取れるプレゼントは隠さない。
- 既存の漢検島の出題・Apple Pencil・記録・報酬や空島への帰り道は変更しない。画面のDOMを移動して見せ方だけ変え、MutationObserverや保存データ移行は使わない。

'''
readme=one(readme,'## Adaptive practice notebook',new_section+'## Adaptive practice notebook','README travel section')
readme_path.write_text(readme,encoding='utf-8')

# Older smoke tests contain literal release-version/cache strings; refresh only those assertions.
for path in Path('.').glob('*.test.cjs'):
    content=path.read_text(encoding='utf-8')
    updated=content.replace('app-v240-release.js?v=2920','app-v240-release.js?v=2930').replace('v2.9.2','v2.9.3')
    if updated!=content:path.write_text(updated,encoding='utf-8')
print('v2.9.3 integrated: airplane + island landing, safe cache bust, smoke suite and README; save untouched.')
