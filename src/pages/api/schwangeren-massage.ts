import type { APIRoute } from 'astro';
import { Buffer } from 'node:buffer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';

    let name: string = '';
    let email: string = '';
    let telefon: string = '';
    let schwangerschaftswoche: string = '';
    let geburtsdatum: string = '';
    let geburtsort: string = '';
    let gewuenschterTermin: string = '';
    let massageArt: string = '';
    let beschwerden: string = '';
    let message: string = '';
    let referrerURL: string | undefined = undefined;
    let fromMailAddress: string = 'anneli@mama-moon-doula.com';
    let replyToAddress: string = 'anneli@mama-moon-doula.com';
    let formMailSubject: string = 'Anfrage für Schwangeren-Massage - Mama-Moon-Doula';
    let emailBodyText: string = 'Neue Anfrage für Schwangeren-Massage von: {ReferrerURL}\n\nName: {Name}\nE-Mail: {SubmitterMailAddress}\nTelefon: {Telefon}\nSchwangerschaftswoche: {Schwangerschaftswoche}\nGeburtsdatum: {Geburtsdatum}\nGeburtsort: {Geburtsort}\nGewünschter Termin: {GewuenschterTermin}\nMassage-Art: {MassageArt}\nBeschwerden: {Beschwerden}\nNachricht: {Message}';
    let customerEmailBodyText: string = 'Vielen Dank für Ihre Anfrage für eine Schwangeren-Massage!\n\nWir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden.\n\nIhre Angaben:\nName: {Name}\nE-Mail: {SubmitterMailAddress}\nTelefon: {Telefon}\nSchwangerschaftswoche: {Schwangerschaftswoche}\nGeburtsdatum: {Geburtsdatum}\nGeburtsort: {Geburtsort}\nGewünschter Termin: {GewuenschterTermin}\nMassage-Art: {MassageArt}\nBeschwerden: {Beschwerden}\nNachricht: {Message}\n\nMit herzlichen Grüßen\nAnneli Pfeifer - Mama-Moon-Doula';

    let attachments: Array<{ filename: string; mimeType: string; base64: string; size: number }> = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = String(formData.get('name') || '');
      email = String(formData.get('email') || '');
      telefon = String(formData.get('telefon') || '');
      schwangerschaftswoche = String(formData.get('schwangerschaftswoche') || '');
      geburtsdatum = String(formData.get('geburtsdatum') || '');
      geburtsort = String(formData.get('geburtsort') || '');
      gewuenschterTermin = String(formData.get('gewuenschterTermin') || '');
      massageArt = String(formData.get('massageArt') || '');
      beschwerden = String(formData.get('beschwerden') || '');
      message = String(formData.get('message') || '');
      referrerURL = String(formData.get('referrerURL') || '');
      fromMailAddress = String(formData.get('fromMailAddress') || fromMailAddress);
      replyToAddress = String(formData.get('replyToAddress') || replyToAddress);
      formMailSubject = String(formData.get('formMailSubject') || formMailSubject);
      emailBodyText = String(formData.get('emailBodyText') || emailBodyText);
      customerEmailBodyText = String(formData.get('customerEmailBodyText') || customerEmailBodyText);

      const files = formData.getAll('attachments') as unknown as File[];
      const maxFiles = 1;
      const maxTotalSize = 10 * 1024 * 1024;
      const allowedMimeTypes = new Set([
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/heic',
        'image/heif',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ]);

      if (files && files.length > 0) {
        if (files.length > maxFiles) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Bitte nur eine Datei hochladen'
          }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        const totalSize = files.reduce((sum, f: any) => sum + (f?.size || 0), 0);
        if (totalSize > maxTotalSize) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Die Gesamtdatenmenge der Anhänge überschreitet 10 MB.'
          }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        for (const f of files) {
          const mimeType = (f as any).type || 'application/octet-stream';
          if (!allowedMimeTypes.has(mimeType)) {
            return new Response(JSON.stringify({
              success: false,
              message: 'Ein oder mehrere Dateitypen sind nicht erlaubt.'
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
          }
          const buf = Buffer.from(new Uint8Array(await (f as any).arrayBuffer()));
          attachments.push({ filename: (f as any).name || 'attachment', mimeType, base64: buf.toString('base64'), size: (f as any).size || 0 });
        }
      }
    } else {
      const body = await request.json();
      name = body?.name;
      email = body?.email;
      telefon = body?.telefon;
      schwangerschaftswoche = body?.schwangerschaftswoche;
      geburtsdatum = body?.geburtsdatum;
      geburtsort = body?.geburtsort;
      gewuenschterTermin = body?.gewuenschterTermin;
      massageArt = body?.massageArt;
      beschwerden = body?.beschwerden;
      message = body?.message;
      referrerURL = body?.referrerURL;
      fromMailAddress = body?.fromMailAddress || fromMailAddress;
      replyToAddress = body?.replyToAddress || replyToAddress;
      formMailSubject = body?.formMailSubject || formMailSubject;
      emailBodyText = body?.emailBodyText || emailBodyText;
      customerEmailBodyText = body?.customerEmailBodyText || customerEmailBodyText;
      attachments = Array.isArray(body?.attachments) ? body.attachments : [];
    }

    // Validierung - alle Felder sind optional für Tests
    // if (!name || !email || !schwangerschaftswoche) {
    //   return new Response(JSON.stringify({
    //     success: false,
    //     message: 'Name, E-Mail-Adresse und Schwangerschaftswoche sind erforderlich'
    //   }), {
    //     status: 400,
    //     headers: {
    //       'Content-Type': 'application/json'
    //     }
    //   });
    // }

    // E-Mail-Validierung - nur wenn E-Mail angegeben wurde
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }

    // Anhang-Validierung (serverseitig)
    if (attachments && Array.isArray(attachments)) {
      const maxFiles = 1;
      const maxTotalSize = 10 * 1024 * 1024;
      const allowedMimeTypes = new Set([
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/heic',
        'image/heif',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ]);

      if (attachments.length > maxFiles) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Bitte nur eine Datei hochladen'
        }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      const totalSize = attachments.reduce((sum: number, a: any) => sum + (a?.size || 0), 0);
      if (totalSize > maxTotalSize) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Die Gesamtdatenmenge der Anhänge überschreitet 10 MB.'
        }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      for (const a of attachments) {
        if (a?.mimeType && !allowedMimeTypes.has(a.mimeType)) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Ein oder mehrere Dateitypen sind nicht erlaubt.'
          }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
      }
    }

    // n8n Webhook URL
    const n8nWebhookUrl = 'https://n8n.seibert.tools/webhook/81c3521f-67ae-4c76-a6f5-d5fb594b0107';

    // E-Mail-Body mit Platzhaltern ersetzen
    const processedEmailBody = emailBodyText
      .replace('{ReferrerURL}', referrerURL || 'Unbekannt')
      .replace('{Name}', name)
      .replace('{SubmitterMailAddress}', email)
      .replace('{Telefon}', telefon || 'Nicht angegeben')
      .replace('{Schwangerschaftswoche}', schwangerschaftswoche)
      .replace('{Geburtsdatum}', geburtsdatum || 'Nicht angegeben')
      .replace('{Geburtsort}', geburtsort || 'Nicht angegeben')
      .replace('{GewuenschterTermin}', gewuenschterTermin || 'Nicht angegeben')
      .replace('{MassageArt}', massageArt || 'Nicht angegeben')
      .replace('{Beschwerden}', beschwerden || 'Keine')
      .replace('{Message}', message || 'Keine');

    // Customer E-Mail-Body mit Platzhaltern ersetzen
    const processedCustomerEmailBody = customerEmailBodyText
      .replace('{ReferrerURL}', referrerURL || 'Unbekannt')
      .replace('{Name}', name)
      .replace('{SubmitterMailAddress}', email)
      .replace('{Telefon}', telefon || 'Nicht angegeben')
      .replace('{Schwangerschaftswoche}', schwangerschaftswoche)
      .replace('{Geburtsdatum}', geburtsdatum || 'Nicht angegeben')
      .replace('{Geburtsort}', geburtsort || 'Nicht angegeben')
      .replace('{GewuenschterTermin}', gewuenschterTermin || 'Nicht angegeben')
      .replace('{MassageArt}', massageArt || 'Nicht angegeben')
      .replace('{Beschwerden}', beschwerden || 'Keine')
      .replace('{Message}', message || 'Keine');

    // Daten an n8n senden
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        telefon,
        schwangerschaftswoche,
        geburtsdatum,
        geburtsort,
        gewuenschterTermin,
        massageArt,
        beschwerden,
        message,
        referrerURL,
        fromMailAddress,
        replyToAddress,
        formMailSubject,
        emailBodyText: processedEmailBody,
        customerEmailBodyText: processedCustomerEmailBody,
        attachments,
        timestamp: new Date().toISOString(),
        source: 'Mama-Moon-Doula Website - Schwangeren-Massage'
      })
    });

    if (!response.ok) {
      throw new Error(`n8n Webhook fehlgeschlagen: ${response.status}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Ihre Anfrage wurde erfolgreich gesendet! Wir melden uns schnellstmöglich bei Ihnen.'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Fehler beim Senden der Schwangeren-Massage Anfrage:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Es gab einen Fehler beim Senden Ihrer Anfrage. Bitte versuchen Sie es später erneut.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
