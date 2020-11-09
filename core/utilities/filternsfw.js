module.exports = function(text) {
	return (text) ? text.replace(/p[e3]{,2}n(?:[i1]s)?|d[i1][ck]+|[ck][o0][ck]+|puss|vag|cl[i1]t|cbt|ba[l1]{2}s|s[e3]x|p[o0]rn|an(?:us|a[1l])|a[s5]{2}[s\s]+|b[o0]{2}b|t[i1]t|n[i1]g/gi, "\\*") : "";
}