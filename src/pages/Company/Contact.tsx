// src/pages/Company/Contact.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// ─── Replace this with your real Formspark form ID ───────────────────────────
const FORMSPARK_FORM_ID = 'ja4VGrql1';
// ─────────────────────────────────────────────────────────────────────────────

// ─── Animations ──────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ─── Layout ───────────────────────────────────────────────────────────────────
const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.dark2};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 2rem 0 4rem;
`;

const ContentWrapper = styled.div`
  max-width: 680px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const BackButton = styled.button`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  transition: all 0.2s ease;
  font-size: 0.95rem;

  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  i { font-size: 1.1rem; }
`;

// ─── Header ───────────────────────────────────────────────────────────────────
const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const IconBox = styled.div`
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  border-radius: ${({ theme }) => theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
  font-size: 1.9rem;
  box-shadow: 0 8px 24px rgba(185, 28, 28, 0.3);
`;

const Title = styled.h1`
  font-size: 2.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.75rem;

  @media (max-width: 640px) { font-size: 2rem; }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.muted};
  line-height: 1.6;
  max-width: 480px;
  margin: 0 auto;
`;

// ─── Form Card ────────────────────────────────────────────────────────────────
const FormCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2.5rem;
  margin-bottom: 2rem;

  @media (max-width: 480px) { padding: 1.5rem; }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.02em;
`;

const inputBase = `
  width: 100%;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
`;

const Input = styled.input<{ hasError?: boolean }>`
  ${inputBase}
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  border-color: ${({ theme, hasError }) =>
    hasError ? 'rgba(185, 28, 28, 0.7)' : theme.colors.dark5};

  &::placeholder { color: ${({ theme }) => theme.colors.text.muted}; }

  &:focus {
    border-color: ${({ theme, hasError }) =>
      hasError ? 'rgba(185, 28, 28, 0.9)' : theme.colors.red4};
    box-shadow: 0 0 0 3px ${({ hasError }) =>
      hasError ? 'rgba(185, 28, 28, 0.15)' : 'rgba(185, 28, 28, 0.12)'};
  }
`;

const Select = styled.select<{ hasError?: boolean }>`
  ${inputBase}
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  border-color: ${({ theme, hasError }) =>
    hasError ? 'rgba(185, 28, 28, 0.7)' : theme.colors.dark5};
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-color: rgba(0, 0, 0, 0.25);
  padding-right: 2.5rem;
  cursor: pointer;

  option {
    background: ${({ theme }) => theme.colors.dark3};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.red4};
    box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.12);
  }
`;

const Textarea = styled.textarea<{ hasError?: boolean }>`
  ${inputBase}
  padding: 0.85rem 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  border-color: ${({ theme, hasError }) =>
    hasError ? 'rgba(185, 28, 28, 0.7)' : theme.colors.dark5};
  resize: vertical;
  min-height: 140px;
  line-height: 1.55;

  &::placeholder { color: ${({ theme }) => theme.colors.text.muted}; }

  &:focus {
    border-color: ${({ theme }) => theme.colors.red4};
    box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.12);
  }
`;

const FieldError = styled.span`
  font-size: 0.8rem;
  color: #fca5a5;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

// ─── Submit Button ────────────────────────────────────────────────────────────
const SubmitButton = styled.button`
  width: 100%;
  padding: 0.95rem 2rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(185, 28, 28, 0.4);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const Spinner = styled.span`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
  display: inline-block;
`;

// ─── Success / Error banners ───────────────────────────────────────────────────
const SuccessBanner = styled.div`
  animation: ${fadeIn} 0.4s ease;
  background: rgba(22, 163, 74, 0.12);
  border: 1px solid rgba(22, 163, 74, 0.4);
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;

  .check {
    width: 64px;
    height: 64px;
    background: rgba(22, 163, 74, 0.15);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.25rem;
    color: #4ade80;
    font-size: 2rem;
  }

  h2 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.95rem;
    line-height: 1.6;
    margin: 0 0 1.5rem;
  }
`;

const ResetButton = styled.button`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.65rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.dark5};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ErrorBanner = styled.div`
  background: rgba(185, 28, 28, 0.12);
  border: 1px solid rgba(185, 28, 28, 0.4);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 0.85rem 1rem;
  color: #fca5a5;
  font-size: 0.9rem;
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin-top: 1rem;
  line-height: 1.5;

  i { flex-shrink: 0; font-size: 1.1rem; margin-top: 0.05rem; }
`;

// ─── Info Grid (keep existing) ─────────────────────────────────────────────────
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-top: 1rem;
`;

const InfoCard = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  text-align: center;

  .info-icon {
    width: 48px;
    height: 48px;
    background: ${({ theme }) => theme.colors.red3};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    color: white;
    font-size: 1.15rem;
  }

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1rem;
    margin-bottom: 0.4rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
  }
`;

// ─── Types / state ─────────────────────────────────────────────────────────────
interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const SUBJECT_OPTIONS = [
  { value: '', label: 'Select a topic…' },
  { value: 'General Question', label: 'General Question' },
  { value: 'Extension', label: 'Extension' },
  { value: 'Bug Report', label: 'Bug Report' },
  { value: 'Feature Request', label: 'Feature Request' },
  { value: 'Business / Partnership', label: 'Business / Partnership' },
  { value: 'Press Inquiry', label: 'Press Inquiry' },
];

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = 'Name is required.';
  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!values.subject) errors.subject = 'Please select a topic.';
  if (!values.message.trim()) {
    errors.message = 'Message is required.';
  } else if (values.message.trim().length < 20) {
    errors.message = 'Message must be at least 20 characters.';
  }
  return errors;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export const Contact: React.FC = () => {
  const navigate = useNavigate();

  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    // Validate just this field on blur
    const fieldErrors = validate(values);
    setErrors((prev) => ({ ...prev, [name]: fieldErrors[name as keyof FormErrors] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Mark all fields touched and validate
    setTouched({ name: true, email: true, subject: true, message: true });
    const fieldErrors = validate(values);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`https://submit-form.com/${FORMSPARK_FORM_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject,
          message: values.message.trim(),
          _email: {
            subject: `[YouTool Contact] ${values.subject} — from ${values.name.trim()}`,
            from: values.name.trim(),
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Formspark submit error:', err);
      setSubmitError(
        "Something went wrong sending your message. Please refresh the page and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setValues({ name: '', email: '', subject: '', message: '' });
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setSubmitError(null);
  };

  return (
    <Container>
      <ContentWrapper>
        {/* Back */}
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        {/* Header */}
        <Header>
          <IconBox>
            <i className="bx bx-envelope"></i>
          </IconBox>
          <Title>Contact Us</Title>
          <Subtitle>
            Have a question, suggestion, or just want to say hello? Fill out the form below and
            we'll get back to you within 24–48 hours.
          </Subtitle>
        </Header>

        {/* Success State */}
        {submitted ? (
          <SuccessBanner>
            <div className="check">
              <i className="bx bx-check"></i>
            </div>
            <h2>Message Sent!</h2>
            <p>
              Thanks for reaching out, {values.name.split(' ')[0]}. We've received your message
              and will reply to <strong>{values.email}</strong> within 24–48 hours.
            </p>
            <ResetButton onClick={handleReset}>Send Another Message</ResetButton>
          </SuccessBanner>
        ) : (
          /* Form */
          <FormCard>
            <form onSubmit={handleSubmit} noValidate>
              <FieldGroup>
                {/* Name + Email row */}
                <FieldRow>
                  <Field>
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Jane Smith"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      hasError={!!(touched.name && errors.name)}
                      autoComplete="name"
                    />
                    {touched.name && errors.name && (
                      <FieldError><i className="bx bx-error-circle"></i>{errors.name}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      hasError={!!(touched.email && errors.email)}
                      autoComplete="email"
                    />
                    {touched.email && errors.email && (
                      <FieldError><i className="bx bx-error-circle"></i>{errors.email}</FieldError>
                    )}
                  </Field>
                </FieldRow>

                {/* Subject */}
                <Field>
                  <Label htmlFor="subject">Topic</Label>
                  <Select
                    id="subject"
                    name="subject"
                    value={values.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    hasError={!!(touched.subject && errors.subject)}
                  >
                    {SUBJECT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                  {touched.subject && errors.subject && (
                    <FieldError><i className="bx bx-error-circle"></i>{errors.subject}</FieldError>
                  )}
                </Field>

                {/* Message */}
                <Field>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us what's on your mind…"
                    value={values.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    hasError={!!(touched.message && errors.message)}
                  />
                  {touched.message && errors.message && (
                    <FieldError><i className="bx bx-error-circle"></i>{errors.message}</FieldError>
                  )}
                </Field>

                {/* Submit */}
                <SubmitButton type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner />
                      Sending…
                    </>
                  ) : (
                    <>
                      <i className="bx bx-send"></i>
                      Send Message
                    </>
                  )}
                </SubmitButton>

                {/* Submit-level error */}
                {submitError && (
                  <ErrorBanner>
                    <i className="bx bx-error-circle"></i>
                    {submitError}
                  </ErrorBanner>
                )}
              </FieldGroup>
            </form>
          </FormCard>
        )}

        {/* Info Cards */}
        <InfoGrid>
          <InfoCard>
            <div className="info-icon"><i className="bx bx-time-five"></i></div>
            <h3>Response Time</h3>
            <p>We typically respond within 24–48 hours on business days.</p>
          </InfoCard>

          <InfoCard>
            <div className="info-icon"><i className="bx bx-support"></i></div>
            <h3>Support Hours</h3>
            <p>Monday – Friday, 9 AM – 6 PM EST. Small team, big care.</p>
          </InfoCard>

          <InfoCard>
            <div className="info-icon"><i className="bx bx-chat"></i></div>
            <h3>Helpful Details</h3>
            <p>Include your browser, the tool you were using, and any error messages for faster support.</p>
          </InfoCard>

          <InfoCard>
            <div className="info-icon"><i className="bx bx-bulb"></i></div>
            <h3>Feature Requests</h3>
            <p>Got an idea for a new tool or improvement? We love hearing from creators!</p>
          </InfoCard>
        </InfoGrid>
      </ContentWrapper>
    </Container>
  );
};
