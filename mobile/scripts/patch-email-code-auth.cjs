const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'App.tsx');
let source = fs.readFileSync(file, 'utf8');

const authState = "const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [authBusy, setAuthBusy] = useState(false);";
if (!source.includes('verificationPending')) {
  if (!source.includes(authState)) throw new Error('Expected native auth state was not found in App.tsx');
  source = source.replace(authState, `${authState} const [verificationPending, setVerificationPending] = useState(false); const [verificationCode, setVerificationCode] = useState('');`);
}

const signUpPattern = /  async function signUp\(\) \{[\s\S]*?\n  async function signOut\(\)/;
const signUpReplacement = `  async function signUp() { if (!supabase) return Alert.alert('Setup needed', 'The native app needs the Supabase URL and publishable key in its environment configuration.'); if (!email.trim() || !password) return Alert.alert('Missing details', 'Enter your email and password.'); if (password.length < 6) return Alert.alert('Password too short', 'Use at least 6 characters.'); setAuthBusy(true); const { data, error } = await supabase.auth.signUp({ email: email.trim(), password }); setAuthBusy(false); if (error) return Alert.alert('Sign up failed', error.message); if (data.session) { setVerificationPending(false); return; } setVerificationCode(''); setVerificationPending(true); Alert.alert('Verification code sent', 'Check your email for the verification code and enter it in Mah Buddy.'); }
  async function verifyEmailCode() { if (!supabase) return; const code = verificationCode.replace(/\\D/g, '').slice(0, 6); if (!email.trim() || code.length !== 6) return Alert.alert('Enter the code', 'Enter the 6-digit verification code from your email.'); setAuthBusy(true); const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code, type: 'signup' }); setAuthBusy(false); if (error) return Alert.alert('Verification failed', error.message); setVerificationPending(false); setVerificationCode(''); }
  async function resendVerificationCode() { if (!supabase || !email.trim()) return; setAuthBusy(true); const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() }); setAuthBusy(false); if (error) return Alert.alert('Could not resend code', error.message); Alert.alert('Code sent', 'A new verification code has been sent to your email.'); }
  async function signOut()`;
if (!signUpPattern.test(source)) throw new Error('Expected native signUp/signOut section was not found in App.tsx');
source = source.replace(signUpPattern, signUpReplacement);

const authScreenPattern = /  if \(!session\) return <SafeAreaView[\s\S]*?\n\n  if \(profileOpen\)/;
const authScreenReplacement = `  if (!session) return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={styles.authContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={styles.authCard}><Text style={styles.title}>Mah Buddy</Text><Text style={styles.subtitle}>{verificationPending ? 'Enter the verification code sent to your email' : 'Your AI study buddy'}</Text>{verificationPending ? <><TextInput value={verificationCode} onChangeText={v => setVerificationCode(v.replace(/\\D/g, '').slice(0, 6))} placeholder="6-digit code" placeholderTextColor="#8a8f98" keyboardType="number-pad" maxLength={6} style={styles.authInput} /><Pressable disabled={authBusy} onPress={verifyEmailCode} style={styles.primary}><Text style={styles.primaryText}>{authBusy ? 'Please wait…' : 'Verify email'}</Text></Pressable><Pressable disabled={authBusy} onPress={resendVerificationCode} style={styles.secondary}><Text style={styles.secondaryText}>Resend code</Text></Pressable><Pressable disabled={authBusy} onPress={() => { setVerificationPending(false); setVerificationCode(''); }}><Text style={styles.action}>Back</Text></Pressable></> : <><TextInput autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#8a8f98" style={styles.authInput} /><TextInput secureTextEntry value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#8a8f98" style={styles.authInput} /><Pressable disabled={authBusy} onPress={signIn} style={styles.primary}><Text style={styles.primaryText}>{authBusy ? 'Please wait…' : 'Sign in'}</Text></Pressable><Pressable disabled={authBusy} onPress={signUp} style={styles.secondary}><Text style={styles.secondaryText}>Create account</Text></Pressable>{!supabase && <Text style={styles.setup}>Native authentication is awaiting Supabase environment configuration.</Text>}</>}</View></KeyboardAvoidingView></SafeAreaView>;

  if (profileOpen)`;
if (!authScreenPattern.test(source)) throw new Error('Expected native auth screen was not found in App.tsx');
source = source.replace(authScreenPattern, authScreenReplacement);

fs.writeFileSync(file, source);
console.log('Mah Buddy native signup OTP authentication patch applied.');
