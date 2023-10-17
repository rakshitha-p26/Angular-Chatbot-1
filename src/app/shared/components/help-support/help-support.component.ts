import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from '../../service/message.service';
import { BehaviorSubject } from 'rxjs';

export interface Message_Info {
  type: string;
  message: string;
}

export interface Generated_Query {
  questions: string;
}

@Component({
  selector: 'app-help-support',
  templateUrl: './help-support.component.html',
  styleUrls: ['./help-support.component.scss'],
})

export class HelpSupportComponent {
  
  messages: Message_Info[] = [];
  show_Ask_More_Button = false;
  state: 'userMode' | 'botMode' | 'relatedQuesMode'| 'feedbackMode' = 'botMode'; // by default state is set to 'botMode'
  messageresult$ = new BehaviorSubject<Array<{ type: string, message: string }>>([]);
  helpBotForm = new FormGroup({
    message: new FormControl('', [Validators.required]),
  });
  isVisible = false;
  loadingAnswer = false;
  loadingQuestions = false;
  @ViewChild('scrollMe') private myScrollContainer: any;
  generatedQuery: Generated_Query[] = [];
  recentAnswers: any;
  feedbackVal: string = "No";
  feedbackMsg: any;
  feedbackSent: boolean = false;

  constructor(private messageService: MessageService) {
    this.messages.push({
      type: 'client',
      message: "Hi there 👋, I'm your personal Digital Assistant.. How can I help you today?",
    });
    this.messageresult$.next(this.messageresult$.getValue().concat([{ type: 'client', message: "Hi there 👋, I'm your personal Digital Assistant.. How can I help you today?"}]));
    this.scrollButton();
  }

  openhelpPopup() {
    this.isVisible = !this.isVisible;
  }
  callFeedback() {
    this.state = 'feedbackMode';
  }

  sendMessageRequest() {
    const sentMessagereq = this.helpBotForm.value.message!;
    console.log('sentMessage=' + sentMessagereq);
    this.loadingAnswer = true;
    this.messages.push({
      type: 'user',
      message: sentMessagereq,
    });
    this.messageresult$.next(this.messageresult$.getValue().concat([{ type: 'user', message: sentMessagereq }]));
    this.helpBotForm.reset();
    this.scrollButton();

    this.messageService.sendMessagetoService(sentMessagereq).subscribe((response: any) => {
      this.loadingAnswer = false;
      this.state = 'relatedQuesMode'; // After receiving a response, change the state to "generated Questions".
      this.recentAnswers = response.answer;
      this.show_Ask_More_Button = response.show_Ask_More_Button;
      this.messages.push({
        type: 'client',
        message: this.recentAnswers,
      });
      this.messageresult$.next(this.messageresult$.getValue().concat([{ type: 'client', message: this.recentAnswers }]));
      console.log('response.answer:', this.recentAnswers);
      this.scrollButton();
    });
  }

  askMoreQuesRequest() {
    this.loadingQuestions = true;
    this.state = 'relatedQuesMode';
    this.generatedQuery = [];
    if(this.recentAnswers) {
      this.messageService.generate_Questions(this.recentAnswers).subscribe((qResponse: any) => {
        this.loadingQuestions = false;
        console.log('this.generatedQuestions:', qResponse.related_questions);
        const questionsObj = qResponse.related_questions;
        console.log('questionsObj:', questionsObj);
        if (questionsObj) {
          const questions = questionsObj;
          console.log('questions=' + questions);
          questions.slice(0, 4).forEach((question: string) => {
            this.generatedQuery.push({
              questions: question,
            });
          });
        }
        console.log('this.questions:', this.generatedQuery);
        console.log('this.messages:', this.messages);
      });
    }
  }

  publishFeedback(feedback: string) {
    //this.state = 'generatedQuestions';
    this.feedbackSent = true;
    this.feedbackVal = feedback;
  
    // Display feedback message based on user's input
    if (feedback === 'Yes') {
      this.feedbackMsg = "I'm happy to hear that! 🎉. Thank you for your feedback! Goodbye.";
    } else if (feedback === 'No') {
      this.feedbackMsg = "We're sorry to hear that. Please type your question below⬇";
    }
  }

  populateInputMessage(question: string) {
    this.helpBotForm.get('message')!.setValue(question);
    this.sendMessageRequest();
    this.state = 'botMode'; // After receiving a response, change the state to "botType".
  }

  scrollButton() {
    setTimeout(() => {
      try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight + 500;
      } catch (err) {}
    }, 150);
  }
}