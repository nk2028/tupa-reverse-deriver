# 切韻拼音反向推導器

切韻拼音反推音韻地位，並可以檢查拼寫合法與否。

## 用法

```javascript
import 拼音反推 from 'tupa-reverse-deriver';

let 地位 = 拼音反推('tshet');
地位.描述; // => 清開四先入

拼音反推('uinh').描述; // => 云合三眞去

拼音反推('ngyoq').描述; // => 疑開三魚上
拼音反推('ngiox').描述; // Error: 無法識別聲調 x (ngiox)【提示：上聲用 -q】
拼音反推('ngioq').描述; // Error: 不合法介音搭配 i-o (ngioq) 【提示：用鈍介音 y/u】

拼音反推('ngyon').描述; // => 疑開三元平
拼音反推('ngian').描述; // Error: 不合法介音搭配 i-an (ngian) 【提示：用鈍介音 y/u】
拼音反推('ngyan').描述; // Error: 音韻地位「疑開三寒平」不合法 (ngyan): Unexpected 等: "三"
                        // 【提示：元韻為 y/uon】
```
